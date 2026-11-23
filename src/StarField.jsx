import { useEffect, useRef } from 'react'

// Deep space behind the whole page: faint stars at three depths that drift at different
// speeds as you scroll (parallax), with a slow, gentle twinkle. Drawn at a low frame rate
// and only when something changes, so it stays light on phones. Still for reduced motion.

const LAYERS = [
  { count: 260, size: [0.3, 0.8], alpha: [0.15, 0.45], speed: 0.03 }, // far
  { count: 110, size: [0.5, 1.1], alpha: [0.25, 0.65], speed: 0.07 }, // middle
  { count: 36, size: [0.9, 1.6], alpha: [0.45, 0.9], speed: 0.14 }, // near
]
const TINTS = ['255,255,255', '214,226,255', '255,240,222', '200,214,255']

export default function StarField() {
  const canvas = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let W = 0
    let H = 0
    let stars = []
    let bright = []
    let far = [] // galaxies and small planets, placed once along the page (not repeated)
    let frame = 0
    let lastDraw = 0
    let dirty = true

    const make = () => {
      // fewer stars on small screens, scaled by area
      const k = Math.min(1, (W * H) / (1440 * 900))
      // a handful of bright stars that shine, with soft cross-shaped glints
      bright = Array.from({ length: W < 700 ? 4 : 8 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1.4 + Math.random() * 0.9,
        len: 9 + Math.random() * 10,
        ph: Math.random() * Math.PI * 2,
        sp: 0.35 + Math.random() * 0.4,
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
      }))
      const sm = W < 700 ? 0.6 : 1
      far = [
        { kind: 'galaxy', x: 0.12, p: 0.1, w: 70, h: 24, rot: -0.35, hue: '200,190,255', speed: 0.55 },
        { kind: 'planet', x: 0.07, p: 0.32, r: 15, ring: true, lit: '205,200,240', dark: '40,36,70', speed: 0.62 },
        { kind: 'galaxy', x: 0.88, p: 0.46, w: 95, h: 30, rot: 0.42, hue: '180,205,255', speed: 0.55 },
        { kind: 'planet', x: 0.6, p: 0.7, r: 8, ring: false, lit: '235,175,150', dark: '60,30,34', speed: 0.62 },
        { kind: 'galaxy', x: 0.3, p: 0.92, w: 60, h: 20, rot: 0.15, hue: '220,190,240', speed: 0.55 },
      ].map((o) => ({ ...o, w: (o.w || 0) * sm, h: (o.h || 0) * sm, r: (o.r || 0) * sm }))
      stars = LAYERS.flatMap((L, li) =>
        Array.from({ length: Math.round(L.count * (0.45 + 0.55 * k)) }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: L.size[0] + Math.random() * (L.size[1] - L.size[0]),
          a: L.alpha[0] + Math.random() * (L.alpha[1] - L.alpha[0]),
          tw: Math.random() < 0.35 ? 0.4 + Math.random() * 0.8 : 0, // some twinkle, slowly
          ph: Math.random() * Math.PI * 2,
          tint: TINTS[Math.floor(Math.random() * TINTS.length)],
          li,
        })),
      )
    }

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      make()
      dirty = true
    }

    const draw = (now) => {
      const sy = window.scrollY
      ctx.clearRect(0, 0, W, H)
      for (const s of stars) {
        const y = (((s.y - sy * LAYERS[s.li].speed) % H) + H) % H
        const tw = s.tw && !still ? 0.6 + 0.4 * Math.sin(now / 1000 * s.tw + s.ph) : 1
        ctx.fillStyle = `rgba(${s.tint},${(s.a * tw).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
        // a soft halo on the nearest, brightest stars
        if (s.li === 2 && s.a > 0.7) {
          ctx.fillStyle = `rgba(${s.tint},${(0.08 * tw).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(s.x, y, s.r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      drawFar(sy)
      drawBright(now, sy)
    }

    const glint = (x, y, len, a, tint) => {
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const g = ctx.createLinearGradient(x - dx * len, y - dy * len, x + dx * len, y + dy * len)
        g.addColorStop(0, `rgba(${tint},0)`)
        g.addColorStop(0.5, `rgba(${tint},${a})`)
        g.addColorStop(1, `rgba(${tint},0)`)
        ctx.fillStyle = g
        if (dx) ctx.fillRect(x - len, y - 0.5, len * 2, 1)
        else ctx.fillRect(x - 0.5, y - len, 1, len * 2)
      }
    }
    const drawBright = (now, sy) => {
      for (const b of bright) {
        const y = (((b.y - sy * 0.18) % H) + H) % H
        const tw = still ? 1 : 0.55 + 0.45 * Math.sin((now / 1000) * b.sp + b.ph)
        const halo = ctx.createRadialGradient(b.x, y, 0, b.x, y, b.r * 9)
        halo.addColorStop(0, `rgba(${b.tint},${(0.35 * tw).toFixed(3)})`)
        halo.addColorStop(1, `rgba(${b.tint},0)`)
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(b.x, y, b.r * 9, 0, Math.PI * 2)
        ctx.fill()
        glint(b.x, y, b.len * (0.7 + 0.3 * tw), (0.75 * tw).toFixed(3), b.tint)
        ctx.fillStyle = `rgba(255,255,255,${(0.6 + 0.4 * tw).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(b.x, y, b.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // a distant galaxy: a tilted, soft spiral smudge with a bright core
    const galaxy = (x, y, o) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(o.rot)
      ctx.scale(1, o.h / o.w)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, o.w)
      g.addColorStop(0, `rgba(255,248,235,0.55)`)
      g.addColorStop(0.08, `rgba(${o.hue},0.32)`)
      g.addColorStop(0.45, `rgba(${o.hue},0.08)`)
      g.addColorStop(1, `rgba(${o.hue},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, o.w, 0, Math.PI * 2)
      ctx.fill()
      // two faint spiral arms
      ctx.strokeStyle = `rgba(${o.hue},0.12)`
      ctx.lineWidth = o.w * 0.09
      for (const a0 of [0, Math.PI]) {
        ctx.beginPath()
        for (let t = 0; t <= 1; t += 0.05) {
          const a = a0 + t * 3.4
          const rr = o.w * (0.12 + 0.62 * t)
          const px = Math.cos(a) * rr
          const py = Math.sin(a) * rr
          if (t === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.stroke()
      }
      ctx.restore()
    }
    // a small planet lit from the top left, optionally with a thin ring
    const planet = (x, y, o) => {
      const ring = (front) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-0.38)
        ctx.scale(1, 0.28)
        ctx.strokeStyle = `rgba(${o.lit},0.45)`
        ctx.lineWidth = o.r * 0.22
        ctx.beginPath()
        ctx.arc(0, 0, o.r * 2, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
      if (o.ring) ring(false)
      const g = ctx.createRadialGradient(x - o.r * 0.4, y - o.r * 0.4, o.r * 0.1, x, y, o.r)
      g.addColorStop(0, `rgba(${o.lit},0.9)`)
      g.addColorStop(0.55, `rgba(${o.dark},0.95)`)
      g.addColorStop(1, `rgba(8,8,16,1)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, o.r, 0, Math.PI * 2)
      ctx.fill()
      if (o.ring) ring(true)
    }
    const drawFar = (sy) => {
      for (const o of far) {
        const x = o.x * W
        // each one crosses the middle of the screen when the page is scrolled to its point `p`
        const maxS = Math.max(1, document.documentElement.scrollHeight - H)
        const y = H * 0.5 + (o.p * maxS - sy) * o.speed
        const pad = Math.max(o.w || 0, (o.r || 0) * 2.5)
        if (y < -pad || y > H + pad) continue
        if (o.kind === 'galaxy') galaxy(x, y, o)
        else planet(x, y, o)
      }
    }

    const loop = (now) => {
      // the twinkle needs only ~12 fps; scrolling marks it dirty for an immediate redraw
      if (dirty || now - lastDraw > 80) {
        draw(now)
        lastDraw = now
        dirty = false
      }
      frame = requestAnimationFrame(loop)
    }

    const onScroll = () => {
      dirty = true
      if (still) draw(performance.now())
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (still) draw(performance.now())
    else frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return <canvas ref={canvas} className="stars-bg" aria-hidden="true" />
}
