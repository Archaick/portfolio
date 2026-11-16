import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { geoCentroid, geoCircle, geoContains, geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature, merge } from 'topojson-client'
import world from 'world-atlas/countries-110m.json'
import GuruPreview from './GuruPreview'
import './TadarusGlobe.css'

// A light copy of Tadarus Global (markaztadarus.com/global): drag to turn the
// Earth, tap a country, zoom with the buttons. Saudi Arabia (where Tadarus
// began) is green, countries with programmes are gold and joined to Makkah by
// a line of light, and the night side is shaded where it is night right now.

const ORIGIN = 'Saudi Arabia'
const PROGRAMS = { Indonesia: [106.8456, -6.2088] } // country → where the line lands (Jakarta)
const HOLY = [
  { name: 'Makkah', at: [39.8262, 21.4225], main: true },
  { name: 'Madinah', at: [39.6111, 24.4686] },
  { name: 'Al-Quds', at: [35.2354, 31.7781] },
]
const MAKKAH = HOLY[0].at
const LEARNER = [106.8456, -6.2088] // a teacher studying now in Jakarta (demo)

const GRATICULE = geoGraticule10()
const SPHERE = { type: 'Sphere' }
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const wrap = (a, b) => ((((b - a) % 360) + 540) % 360) - 180

// Countries, with historic Palestine drawn as one shape (as on the real site).
const COUNTRIES = (() => {
  const geoms = world.objects.countries.geometries
  const parts = ['376', '275']
  const palestine = {
    type: 'Feature',
    properties: { name: 'Palestine' },
    geometry: merge(world, geoms.filter((g) => parts.includes(g.id))),
  }
  return [
    ...feature(world, { type: 'GeometryCollection', geometries: geoms.filter((g) => !parts.includes(g.id)) }).features,
    palestine,
  ].map((f) => ({ name: f.properties.name, feature: f, centre: geoCentroid(f) }))
})()

/** Where the sun is overhead now, [lon, lat]. */
function subsolarPoint(date = new Date()) {
  const rad = Math.PI / 180
  const d = date.getTime() / 86400000 - 10957.5
  const g = (357.529 + 0.98560028 * d) * rad
  const q = 280.459 + 0.98564736 * d
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad
  const e = (23.439 - 0.00000036 * d) * rad
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / rad
  const dec = Math.asin(Math.sin(e) * Math.sin(L)) / rad
  const gmst = (18.697374558 + 24.06570982441908 * d) * 15
  return [((((ra - gmst) % 360) + 540) % 360) - 180, dec]
}

function describe(name) {
  if (!name) return null
  if (name === ORIGIN) return { name, kind: 'origin', text: 'Where Tadarus began — Makkah al-Mukarramah.' }
  if (PROGRAMS[name]) return { name, kind: 'program', text: 'Tadarus programmes run here, joined to Makkah.' }
  return { name, kind: 'none', text: 'No Tadarus programme here yet.' }
}

export default function TadarusGlobe() {
  const box = useRef(null)
  const [size, setSize] = useState({ w: 560, h: 460 })
  const view = useRef({ lambda: -75, phi: -8, zoom: 1 })
  const motion = useRef({ vx: 0, flight: null, dragging: false, lastInput: 0 })
  const [, setTick] = useState(0)
  const redraw = useCallback(() => setTick((n) => (n + 1) % 1e9), [])
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [onScreen, setOnScreen] = useState(false)
  // the Tadarus Guru preview: opens by itself the first time the globe is seen, or from the bubble
  const [guru, setGuru] = useState(false)
  const opened = useRef(false)
  const sun = useMemo(() => subsolarPoint(), [])
  const reduceMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])

  useEffect(() => {
    const el = box.current
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect
      if (width && height) setSize({ w: width, h: height })
    })
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting))
    ro.observe(el)
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!onScreen || opened.current) return undefined
    const id = setTimeout(() => {
      opened.current = true
      setGuru(true)
    }, 1800)
    return () => clearTimeout(id)
  }, [onScreen])

  const flyTo = useCallback((target, ms = 1100) => {
    const from = { ...view.current }
    const to = { lambda: from.lambda + wrap(from.lambda, target.lambda), phi: target.phi, zoom: target.zoom }
    motion.current.flight = { from, to, start: performance.now(), ms: reduceMotion ? 1 : ms }
    motion.current.vx = 0
    motion.current.lastInput = performance.now()
  }, [reduceMotion])

  // one loop, only while the globe is on screen: flights, momentum, slow idle spin
  useEffect(() => {
    if (!onScreen) return undefined
    let frame
    let last = performance.now()
    const step = (now) => {
      const dt = Math.min(64, now - last)
      last = now
      const m = motion.current
      const v = view.current
      let moved = false
      if (m.flight) {
        const t = clamp((now - m.flight.start) / m.flight.ms, 0, 1)
        const e = ease(t)
        const { from, to } = m.flight
        v.lambda = from.lambda + (to.lambda - from.lambda) * e
        v.phi = from.phi + (to.phi - from.phi) * e
        v.zoom = from.zoom * Math.pow(to.zoom / from.zoom, e)
        if (t >= 1) m.flight = null
        moved = true
      } else if (!m.dragging && Math.abs(m.vx) > 0.002) {
        v.lambda += m.vx * dt
        m.vx *= Math.pow(0.93, dt / 16)
        moved = true
      } else if (!reduceMotion && !m.dragging && !selected && !guru && now - m.lastInput > 4000) {
        v.lambda += (4 * dt) / 1000
        moved = true
      }
      if (moved) redraw()
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [onScreen, reduceMotion, selected, guru, redraw])

  useEffect(() => {
    if (guru) flyTo({ lambda: -LEARNER[0] + 18, phi: -14, zoom: 1.1 })
  }, [guru, flyTo])

  const base = Math.min(size.w, size.h) * 0.42
  const scale = base * view.current.zoom
  const projection = geoOrthographic()
    .translate([size.w / 2, size.h / 2])
    .scale(scale)
    .rotate([view.current.lambda, view.current.phi])
    .clipAngle(90)
  const path = geoPath(projection)
  const centre = [-view.current.lambda, -view.current.phi]
  const visible = (p) => geoDistance(p, centre) < Math.PI / 2 - 0.03

  const cx = size.w / 2
  const countryAt = (x, y) => {
    const dx = x - cx
    const dy = y - size.h / 2
    if (dx * dx + dy * dy > scale * scale) return null
    const p = projection.invert([x, y])
    return p ? COUNTRIES.find((c) => geoContains(c.feature, p))?.name || null : null
  }

  // ---- input: drag sideways to turn (vertical swipes still scroll the page on phones)
  const g = useRef(null)
  const local = (e) => {
    const r = box.current.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  const down = (e) => {
    box.current.setPointerCapture?.(e.pointerId)
    const p = local(e)
    g.current = { start: p, last: p, t: performance.now(), moved: false }
    Object.assign(motion.current, { flight: null, vx: 0, dragging: true, lastInput: performance.now() })
  }
  const move = (e) => {
    const p = local(e)
    if (!g.current) {
      if (e.pointerType === 'mouse') setHover(countryAt(p[0], p[1]))
      return
    }
    const s = g.current
    if (!s.moved && Math.hypot(p[0] - s.start[0], p[1] - s.start[1]) > 5) s.moved = true
    if (!s.moved) return
    const degPerPx = 57.3 / scale
    const dx = p[0] - s.last[0]
    const dy = p[1] - s.last[1]
    view.current.lambda += dx * degPerPx
    view.current.phi = clamp(view.current.phi - dy * degPerPx, -70, 70)
    const now = performance.now()
    motion.current.vx = (dx * degPerPx) / Math.max(1, now - s.t)
    s.last = p
    s.t = now
    motion.current.lastInput = now
    redraw()
  }
  const up = (e) => {
    const s = g.current
    g.current = null
    motion.current.dragging = false
    if (s && !s.moved && e.type === 'pointerup') {
      const p = local(e)
      const name = countryAt(p[0], p[1])
      setSelected(name)
      const c = COUNTRIES.find((x) => x.name === name)
      if (c) flyTo({ lambda: -c.centre[0], phi: clamp(-c.centre[1], -60, 60), zoom: Math.max(view.current.zoom, 1.6) })
    }
  }
  const zoomBy = (f) => flyTo({ ...view.current, zoom: clamp(view.current.zoom * f, 0.8, 6) }, 350)
  const home = () => {
    setSelected(null)
    flyTo({ lambda: -75, phi: -8, zoom: 1 })
  }

  const night = geoCircle().center([sun[0] + 180, -sun[1]]).radius(90)()
  const twilight = geoCircle().center([sun[0] + 180, -sun[1]]).radius(96)()
  const lines = Object.values(PROGRAMS).map((to) => ({ type: 'LineString', coordinates: [MAKKAH, to] }))
  const info = describe(selected || hover)

  return (
    <div className="tg">
      <div
        ref={box}
        className="tg-box"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={() => setHover(null)}
        style={{ cursor: hover ? 'pointer' : 'grab' }}
        role="img"
        aria-label="Interactive globe: Tadarus began in Makkah, Saudi Arabia, and has programmes in Indonesia."
      >
        <svg width={size.w} height={size.h} aria-hidden="true">
          <defs>
            <radialGradient id="tg-ocean" cx="38%" cy="32%" r="75%">
              <stop offset="0" stopColor="#1d4f9a" />
              <stop offset="0.6" stopColor="#0f2e66" />
              <stop offset="1" stopColor="#081a40" />
            </radialGradient>
            <radialGradient id="tg-air" cx="50%" cy="50%" r="50%">
              <stop offset="0.86" stopColor="#5fa8ff" stopOpacity="0" />
              <stop offset="0.93" stopColor="#5fa8ff" stopOpacity="0.28" />
              <stop offset="1" stopColor="#5fa8ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={size.h / 2} r={scale * 1.16} fill="url(#tg-air)" />
          <path d={path(SPHERE)} fill="url(#tg-ocean)" />
          <path d={path(GRATICULE)} className="tg-grat" />
          {COUNTRIES.map((c) => {
            const d = path(c.feature)
            if (!d) return null
            const cls = [
              'tg-country',
              c.name === ORIGIN && 'origin',
              PROGRAMS[c.name] && 'program',
              (c.name === selected || c.name === hover) && 'active',
            ].filter(Boolean).join(' ')
            return <path key={c.name} d={d} className={cls} />
          })}
          <path d={path(twilight)} className="tg-twilight" />
          <path d={path(night)} className="tg-night" />
          {lines.map((l, i) => <path key={i} d={path(l) || ''} className="tg-line" />)}
          {Object.entries(PROGRAMS).map(([name, at]) => visible(at) && (
            <g key={name} transform={`translate(${projection(at)})`}>
              <circle r="8" className="tg-pulse" />
              <circle r="3.4" className="tg-dot" />
            </g>
          ))}
          {HOLY.map((h) => visible(h.at) && (
            <g key={h.name} transform={`translate(${projection(h.at)})`}>
              <circle r={h.main ? 5 : 3.5} className={h.main ? 'tg-holy main' : 'tg-holy'} />
              <text x={h.main ? 9 : 7} y="4" className="tg-label">{h.name}</text>
            </g>
          ))}
        </svg>

        {visible(LEARNER) && (() => {
          const [x, y] = projection(LEARNER)
          // the mini app sits above the dot (below it when the dot is near the top), kept inside the box
          const below = y < 150
          const left = Math.min(Math.max(x, 96), size.w - 96)
          return (
            <>
              <button
                type="button"
                className={`tg-learner ${guru ? 'open' : ''}`}
                style={{ left: x, top: y }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setGuru((g) => !g)}
                aria-expanded={guru}
                aria-label={guru ? 'Hide Tadarus Guru' : 'A teacher is studying now in Jakarta: show Tadarus Guru'}
              >
                <span className="tg-learner-dot" />
              </button>
              {guru && (
                <div
                  className={`tg-pop ${below ? 'below' : ''}`}
                  style={{ left, top: y, '--tail': `${x - left}px` }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <GuruPreview below={below} />
                </div>
              )}
            </>
          )
        })()}

        <div className="tg-tools">
          <button type="button" onClick={() => zoomBy(1.5)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out">−</button>
          <button type="button" onClick={home} aria-label="Back to the whole Earth">⟲</button>
        </div>
      </div>

      <div className={`tg-info ${info ? info.kind : ''}`} aria-live="polite">
        {info ? (
          <>
            <strong>{info.name}</strong>
            <span>{info.text}</span>
          </>
        ) : (
          <span>Drag to turn the Earth · tap a country · tap the green dot to see a teacher learning</span>
        )}
      </div>
      <ul className="tg-legend">
        <li><i className="origin" /> Where Tadarus began</li>
        <li><i className="program" /> Tadarus programmes</li>
        <li><i className="learner" /> Studying now</li>
        <li><i className="night" /> Night right now</li>
      </ul>
    </div>
  )
}
