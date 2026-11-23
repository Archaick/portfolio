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
    let frame = 0
    let lastDraw = 0
    let dirty = true

    const make = () => {
      // fewer stars on small screens, scaled by area
      const k = Math.min(1, (W * H) / (1440 * 900))
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
