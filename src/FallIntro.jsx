import { useEffect, useRef } from 'react'

// The opening: you drop from high in the night sky towards the dawn horizon.
// Stars and thin cloud stream up past you in perspective (they rush out of a
// vanishing point below the screen and grow as they near), the fall slows, the
// gold horizon rises, and the hero settles in. A gold loading bar runs under
// it: it follows the fall and also waits for the fonts, so the page is ready
// when it lands. ~3 s; only Esc skips it. Nothing flashes.

const FALL_MS = 2800
const FADE_MS = 600
const READY_LATEST_MS = 6000 // never wait longer than this for the fonts
const smooth = (a, b, t) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}
const rgb = (c) => (c.match(/\d+/g) || [0, 0, 0]).map(Number)
// colour a → b by t, as rgb()
const mixRgb = (a, b, t) => `rgb(${rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t)).join(',')})`
const DEEP = 'rgb(2,4,13)'

export default function FallIntro({ skyTop, skyMid, skyLow, glow: glowTo = 0.3, gentle = false, onDone }) {
  const canvas = useRef(null)
  const wrap = useRef(null)
  const bar = useRef(null)
  const pct = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    // the page waits under the fall: no scrolling until it lands
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    // ready once the fonts are in (or after READY_LATEST_MS at the latest)
    let ready = false
    const markReady = () => (ready = true)
    document.fonts?.ready.then(markReady, markReady)
    if (!document.fonts) ready = true
    const latest = setTimeout(markReady, READY_LATEST_MS)

    // seeded so it plays the same each time
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const spread = () => (rnd() - 0.5) * 2
    const make = (cloud) => ({
      x: spread() * (cloud ? 1.6 : 2.4),
      y: -rnd() * (cloud ? 2.2 : 3.2), // above the vanishing point (it sits below the screen)
      z: 0.15 + rnd() * 1.85,
      r: cloud ? 60 + rnd() * 140 : 0.5 + rnd() * 1.1,
      a: cloud ? 0.06 + rnd() * 0.07 : 0.5 + rnd() * 0.5,
      cloud,
    })
    const stars = Array.from({ length: 320 }, () => make(false))
    const clouds = Array.from({ length: 14 }, () => make(true))

    let start = performance.now()
    let last = start
    let ending = null // time the fade began
    let frame

    const finish = () => {
      if (ending) return
      ending = performance.now()
    }
    // only Esc skips (a keyboard way out); taps and scrolls wait for the landing
    const skip = (e) => {
      if (e.key !== 'Escape' || ending) return
      start = performance.now() - FALL_MS
      ready = true
      finish()
    }
    window.addEventListener('keydown', skip)

    const draw = (now) => {
      const dt = Math.min(50, now - last) / 1000
      last = now
      const t = Math.min(1, (now - start) / (gentle ? FALL_MS * 0.8 : FALL_MS))
      // speed: a quick lean-in, a long fall, then easing to rest
      const speed = (gentle ? 0.7 : 2.2) * smooth(0, 0.15, t) * (1 - smooth(0.45, 1, t)) + 0.03
      const vx = W / 2
      const vy = H * 1.18 // vanishing point, below the screen: we fall towards the horizon
      const f = Math.max(W, H) * 0.42

      // the sky: deep space at first, ending exactly on the hero's own sky
      const k = smooth(0.15, 1, t)
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, mixRgb(DEEP, skyTop, k))
      g.addColorStop(0.55, mixRgb(DEEP, skyMid, k))
      g.addColorStop(1, mixRgb(DEEP, skyLow, k))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // the horizon glow rising from below, to the hero's own strength
      const gy = H * (1.6 - 0.45 * k)
      const glow = ctx.createRadialGradient(vx, gy, 0, vx, gy, H * 0.9)
      glow.addColorStop(0, `rgba(240,190,120,${0.6 * glowTo * k})`)
      glow.addColorStop(1, 'rgba(240,190,120,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      const step = (p) => {
        let z0 = p.z
        p.z -= speed * dt * (p.cloud ? 0.8 : 1)
        if (p.z < 0.08) {
          // passed us: start again far below, with no streak back to where it was
          Object.assign(p, make(p.cloud), { z: 2 })
          z0 = p.z
        }
        const sx = vx + (p.x / p.z) * f
        const sy = vy + (p.y / p.z) * f
        const px = vx + (p.x / z0) * f
        const py = vy + (p.y / z0) * f
        const near = Math.min(1, 0.6 / p.z)
        return { sx, sy, px, py, near }
      }

      // thin cloud passing by
      for (const c of clouds) {
        const { sx, sy, near } = step(c)
        if (sy < -400 || sx < -400 || sx > W + 400) continue
        const r = c.r * near * 2.2
        const cg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r)
        cg.addColorStop(0, `rgba(200,215,255,${c.a * near * smooth(0.05, 0.3, t) * (1 - smooth(0.55, 0.9, t))})`)
        cg.addColorStop(1, 'rgba(200,215,255,0)')
        ctx.fillStyle = cg
        ctx.beginPath()
        ctx.ellipse(sx, sy, r * 1.6, r, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // stars, drawn as short streaks along their path
      ctx.lineCap = 'round'
      for (const s of stars) {
        const { sx, sy, px, py, near } = step(s)
        if (sy < -20 || sy > H + 20 || sx < -20 || sx > W + 20) continue
        ctx.strokeStyle = `rgba(255,255,255,${s.a * (0.35 + 0.65 * near)})`
        ctx.lineWidth = s.r * (0.6 + near)
        ctx.beginPath()
        // gentle: dots, not streaks
        ctx.moveTo(gentle ? sx : px, gentle ? sy : py)
        ctx.lineTo(sx + 0.01, sy)
        ctx.stroke()
      }

      // the loading bar: the fall's progress, held just short of full until the page is ready
      const done = Math.min(t, ready ? 1 : 0.94)
      if (bar.current) bar.current.style.transform = `scaleX(${done})`
      if (pct.current) pct.current.textContent = `${Math.round(done * 100)}%`

      if (t >= 1 && ready) finish()
      let alpha = 1
      if (ending) {
        alpha = 1 - Math.min(1, (now - ending) / FADE_MS)
        if (alpha <= 0) {
          onDone()
          return
        }
      }
      wrap.current.style.opacity = alpha
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', skip)
      clearTimeout(latest)
      root.style.overflow = overflow
    }
    // runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrap} className="fall" role="progressbar" aria-label="Loading">
      <canvas ref={canvas} aria-hidden="true" />
      <div className="fall-load" aria-hidden="true">
        <div className="fall-bar"><i ref={bar} /></div>
        <span><b>Loading</b> <em ref={pct}>0%</em></span>
      </div>
    </div>
  )
}
