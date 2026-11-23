import { useEffect, useRef } from 'react'

// A dark room with one beam of light and dust floating in it.
// - The beam runs from `beam.from` to `beam.to` (fractions of the box) and widens as it goes.
// - Dust glows brighter inside the beam; a pointer or finger gently pushes it aside.
// - With `gather` (a ref to an element holding [data-line] spans), the dust first gathers
//   into those lines of text, then `onReveal` lets the real text fade in and the gathered
//   dust drifts apart. `onProgress(0..1)` drives a loading line; it waits for the fonts.
// - `steer` (a ref holding { from, to, strength }) moves the beam smoothly, e.g. to spotlight
//   whatever the visitor is reading.
// - `api` (a ref) receives { gatherInto(el) }: dust gathers into that element's text and the
//   returned promise resolves when the real text should appear. Used for section titles.
// Still (no motion) for visitors who ask for reduced motion.

const TAU = Math.PI * 2
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const GATHER_MS = 1900
const RELEASE_MS = 900
const TITLE_MS = 1150
const lerp = (a, b, k) => a + (b - a) * k

export default function DustField({
  className = '',
  beam = { from: [0.92, -0.15], to: [0.28, 1.1] },
  density = 1,
  beamStrength = 34,
  tint = [220, 230, 255], // starlight: a cool, pale blue-white
  gather = null,
  steer = null,
  api = null,
  onProgress,
  onReveal,
  onDone,
}) {
  const canvas = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    const host = cv.parentElement
    const ctx = cv.getContext('2d')
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let W = 0
    let H = 0
    let dpr = 1
    let beamImg = null
    let dust = []
    let frame = 0
    let visible = true
    const pointer = { x: -1e4, y: -1e4, on: false }

    // ---- the beam: brightness 0..1 at (x, y); widens with distance from the source
    const cur = { from: [...beam.from], to: [...beam.to], strength: beamStrength }
    const S = () => [cur.from[0] * W, cur.from[1] * H]
    const E = () => [cur.to[0] * W, cur.to[1] * H]
    const beamAt = (x, y) => {
      const [sx, sy] = S()
      const [ex, ey] = E()
      const dx = ex - sx
      const dy = ey - sy
      const len = Math.hypot(dx, dy)
      const ux = dx / len
      const uy = dy / len
      const px = x - sx
      const py = y - sy
      const along = Math.max(0, px * ux + py * uy)
      const perp = Math.abs(px * -uy + py * ux)
      const width = 30 + along * 0.32
      return Math.exp(-((perp / width) ** 2)) * Math.min(1, along / (len * 0.15)) * (1 - Math.min(1, along / (len * 1.15)) * 0.55)
    }

    // the beam's soft light, drawn small once per size and scaled up
    const paintBeam = () => {
      const s = 8
      const bw = Math.max(1, Math.ceil(W / s))
      const bh = Math.max(1, Math.ceil(H / s))
      const off = document.createElement('canvas')
      off.width = bw
      off.height = bh
      const octx = off.getContext('2d')
      const img = octx.createImageData(bw, bh)
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const v = beamAt(x * s, y * s)
          const i = (y * bw + x) * 4
          img.data[i] = tint[0]
          img.data[i + 1] = tint[1]
          img.data[i + 2] = tint[2]
          img.data[i + 3] = Math.round(v * cur.strength)
        }
      }
      octx.putImageData(img, 0, 0)
      beamImg = off
    }
    // ease the beam toward where `steer` points; repaint only while it is moving
    let repaintAt = 0
    const steerBeam = (now) => {
      const t = steer?.current
      if (!t) return
      const k = 0.06
      let moved = 0
      for (const key of ['from', 'to']) {
        for (const i of [0, 1]) {
          const nv = lerp(cur[key][i], t[key][i], k)
          moved += Math.abs(nv - cur[key][i])
          cur[key][i] = nv
        }
      }
      const ns = lerp(cur.strength, t.strength ?? beamStrength, k)
      moved += Math.abs(ns - cur.strength) / 100
      cur.strength = ns
      if (moved > 0.0004 && now - repaintAt > 32) {
        repaintAt = now
        paintBeam()
      }
    }

    const makeDust = () => {
      const n = Math.round(Math.min(320, (W * H) / 4800) * density)
      dust = Array.from({ length: n }, () => {
        // more dust inside the beam, where it is visible
        let x
        let y
        let tries = 0
        do {
          x = Math.random() * W
          y = Math.random() * H
          tries++
        } while (Math.random() > 0.25 + beamAt(x, y) * 0.75 && tries < 6)
        return { x, y, z: 0.35 + Math.random() * 0.65, vx: 0, vy: 0, ph: Math.random() * TAU, sp: 0.4 + Math.random() * 0.8 }
      })
    }

    const resize = () => {
      const r = host.getBoundingClientRect()
      W = Math.max(1, r.width)
      H = Math.max(1, r.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paintBeam()
      makeDust()
    }

    // ---- pointer and touch: push the dust, and move the text sheen
    const local = (cx, cy) => {
      const r = host.getBoundingClientRect()
      return [cx - r.left, cy - r.top]
    }
    const move = (cx, cy) => {
      const [x, y] = local(cx, cy)
      if (x < 0 || y < 0 || x > W || y > H) {
        pointer.on = false
        return
      }
      pointer.x = x
      pointer.y = y
      pointer.on = true
      host.style.setProperty('--mx', `${(x / W) * 100}%`)
      host.style.setProperty('--my', `${(y / H) * 100}%`)
    }
    const onPointer = (e) => move(e.clientX, e.clientY)
    const onTouch = (e) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY)
    const leave = () => {
      pointer.on = false
    }
    // listen on the window: content above the canvas would otherwise catch the events
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('touchend', leave)

    // ---- gathering into the headline
    let finished = !gather

    const sampleText = (root, cap) => {
      if (!root) return []
      const found = [...root.querySelectorAll('[data-line]')]
      const lines = found.length ? found : [root]
      const hr = host.getBoundingClientRect()
      const off = document.createElement('canvas')
      off.width = Math.ceil(W)
      off.height = Math.ceil(H)
      const o = off.getContext('2d')
      o.fillStyle = '#fff'
      let fontPx = 40
      // draw each word where the browser actually laid it out, so wrapped lines match exactly
      for (const el of lines) {
        const cs = getComputedStyle(el)
        fontPx = parseFloat(cs.fontSize)
        o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        if ('letterSpacing' in o) o.letterSpacing = cs.letterSpacing
        o.textBaseline = 'alphabetic'
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        const range = document.createRange()
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent
          for (const m of text.matchAll(/\S+/g)) {
            range.setStart(node, m.index)
            range.setEnd(node, m.index + m[0].length)
            const r = range.getBoundingClientRect()
            if (!r.width) continue
            const mt = o.measureText(m[0])
            const baseline = r.top - hr.top + (r.height + mt.actualBoundingBoxAscent - mt.actualBoundingBoxDescent) / 2
            o.fillText(m[0], r.left - hr.left, baseline)
          }
        }
      }
      const step = Math.max(3, Math.round(fontPx / 20))
      const data = o.getImageData(0, 0, off.width, off.height).data
      const pts = []
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) pts.push([x, y])
        }
      }
      // shuffle and cap (fewer on small screens)
      for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pts[i], pts[j]] = [pts[j], pts[i]]
      }
      return pts.slice(0, cap ?? (W < 700 ? 750 : 1700))
    }

    // a gathering job: dust flies to points sampled from an element, then lifts off when it reveals
    const jobs = []
    const makeJob = (el, { cap, ms, near, onShow, onEnd, progress }) => {
      const r0 = el.getBoundingClientRect()
      const pts = sampleText(el, cap)
      const parts = pts.map(([tx, ty]) => {
        // from anywhere in the room, or from around the title for small ones
        const sx = near ? tx + (Math.random() - 0.5) * W * 0.7 : Math.random() * W
        const sy = near ? ty + (Math.random() - 0.5) * H * 0.6 : Math.random() * H
        return { sx, sy, tx, ty, d: Math.random() * 0.45, wob: (Math.random() - 0.5) * 120 }
      })
      const job = { el, r0, parts, ms, start: performance.now(), revealed: false, released: 0, onShow, onEnd, progress }
      jobs.push(job)
      return job
    }
    const startGather = () => {
      makeJob(gather.current, {
        ms: GATHER_MS,
        progress: true,
        onShow: () => onReveal?.(),
        onEnd: () => {
          if (!finished) {
            finished = true
            onDone?.()
          }
        },
      })
    }
    if (api) {
      api.current = {
        gatherInto: (el) =>
          new Promise((resolve) => {
            if (still) return resolve()
            const job = makeJob(el, { cap: W < 700 ? 320 : 650, ms: TITLE_MS, near: true, onShow: resolve })
            if (!job.parts.length) resolve()
          }),
      }
    }

    // ---- one loop
    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min(48, now - last) / 16.67
      last = now
      steerBeam(now)
      ctx.clearRect(0, 0, W, H)
      if (beamImg) ctx.drawImage(beamImg, 0, 0, W, H)

      const R = Math.max(110, Math.min(W, H) * 0.18)
      for (const p of dust) {
        // slow drift, like dust turning in still air
        p.ph += 0.004 * p.sp * dt
        p.vx += Math.cos(p.ph * 1.3) * 0.004 * dt
        p.vy += (Math.sin(p.ph) * 0.004 - 0.0012) * dt
        let glow = 0
        if (pointer.on) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < R && d > 0.01) {
            const f = (1 - d / R) ** 2
            p.vx += (dx / d) * f * 0.9 * dt
            p.vy += (dy / d) * f * 0.9 * dt
            glow = f
          }
        }
        p.vx *= 0.94
        p.vy *= 0.94
        p.x += p.vx * dt * p.z
        p.y += p.vy * dt * p.z
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10
        const b = beamAt(p.x, p.y)
        const tw = 0.65 + 0.35 * Math.sin(p.ph * 3)
        const a = Math.min(1, (0.06 + 0.8 * b) * tw * p.z + glow * 0.55)
        if (a < 0.02) continue
        ctx.fillStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${a.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 0.45 + 1.3 * p.z + glow, 0, TAU)
        ctx.fill()
      }

      for (let j = jobs.length - 1; j >= 0; j--) {
        const job = jobs[j]
        const t = (now - job.start) / job.ms
        if (job.progress) onProgress?.(Math.min(1, 0.15 + Math.max(0, t) * 0.85))
        if (t >= 1 && !job.revealed) {
          job.revealed = true
          job.released = now
          job.onShow?.()
        }
        const fade = job.revealed ? 1 - Math.min(1, (now - job.released) / RELEASE_MS) : 1
        // follow the element if the page scrolls while the dust is gathering
        const r = job.el.getBoundingClientRect()
        const ox = r.left - job.r0.left
        const oy = r.top - job.r0.top
        ctx.fillStyle = '#fff'
        for (const g of job.parts) {
          const k = Math.min(1, Math.max(0, (t - g.d) / (1 - g.d)))
          const e = ease(k)
          // a gentle curve on the way in
          const curve = Math.sin(e * Math.PI) * g.wob
          let x = g.sx + (g.tx + ox - g.sx) * e + curve * 0.3
          let y = g.sy + (g.ty + oy - g.sy) * e - curve * 0.15
          if (job.revealed) {
            // once the text is there, the dust lifts off it softly
            const lift = 1 - fade
            x += Math.sin(g.wob) * 18 * lift
            y -= 26 * lift * (0.5 + Math.abs(Math.cos(g.wob)))
          }
          const a = (0.25 + 0.75 * e) * fade
          if (a < 0.02) continue
          ctx.globalAlpha = a
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6)
        }
        ctx.globalAlpha = 1
        if (job.revealed && fade <= 0) {
          jobs.splice(j, 1)
          job.onEnd?.()
        }
      }
      if (!still && visible) frame = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
    })
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => {
      const was = visible
      visible = e.isIntersecting
      if (visible && !was && !still) {
        last = performance.now()
        frame = requestAnimationFrame(draw)
      }
    })
    io.observe(host)

    let cancelled = false
    if (gather && !still) {
      onProgress?.(0.05)
      const fonts = document.fonts?.ready ?? Promise.resolve()
      const latest = new Promise((r) => setTimeout(r, 4000))
      Promise.race([fonts, latest]).then(() => {
        if (cancelled) return
        requestAnimationFrame(() => {
          if (!cancelled) startGather()
        })
      })
    } else if (gather) {
      onReveal?.()
      onDone?.()
    }

    if (still) draw(performance.now())
    else frame = requestAnimationFrame(draw)

    // Esc skips the gathering
    const skip = (e) => {
      if (e.key === 'Escape') for (const job of jobs) if (!job.revealed) job.start = performance.now() - job.ms
    }
    window.addEventListener('keydown', skip)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchstart', onTouch)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('touchend', leave)
    }
    // set up once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvas} className={`dust ${className}`} aria-hidden="true" />
}
