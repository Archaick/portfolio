// Sky colours for the hero, following the local time in Jakarta (WIB, UTC+7).
// Keyframes are minutes since midnight; colours are blended between them.

const KEYFRAMES = [
  { m: 0,    top: '#040917', mid: '#0a1530', low: '#132443', stars: 1,    glow: 0.05 },
  { m: 270,  top: '#040917', mid: '#0a1530', low: '#132443', stars: 1,    glow: 0.05 }, // 04:30
  { m: 300,  top: '#08122b', mid: '#18284d', low: '#3a3c62', stars: 0.8,  glow: 0.25 }, // 05:00 subuh
  { m: 345,  top: '#152a55', mid: '#43578a', low: '#c48a58', stars: 0.3,  glow: 0.85 }, // 05:45 dawn
  { m: 400,  top: '#1d4675', mid: '#456f9b', low: '#cfa978', stars: 0,    glow: 0.5  }, // 06:40
  { m: 600,  top: '#173f6b', mid: '#33628e', low: '#6f94b6', stars: 0,    glow: 0.12 }, // 10:00
  { m: 1010, top: '#173f6b', mid: '#33628e', low: '#6f94b6', stars: 0,    glow: 0.12 }, // 16:50
  { m: 1070, top: '#16284f', mid: '#544774', low: '#c27c4c', stars: 0.25, glow: 0.85 }, // 17:50 maghrib
  { m: 1130, top: '#070f28', mid: '#122049', low: '#2b3460', stars: 0.85, glow: 0.2  }, // 18:50
  { m: 1200, top: '#040917', mid: '#0a1530', low: '#132443', stars: 1,    glow: 0.05 }, // 20:00
  { m: 1440, top: '#040917', mid: '#0a1530', low: '#132443', stars: 1,    glow: 0.05 },
]

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}

export function jakartaMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const h = Number(parts.find((p) => p.type === 'hour').value)
  const m = Number(parts.find((p) => p.type === 'minute').value)
  return h * 60 + m
}

export function skyAt(minutes) {
  let i = 0
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].m <= minutes) i++
  const a = KEYFRAMES[i]
  const b = KEYFRAMES[i + 1]
  const t = (minutes - a.m) / (b.m - a.m || 1)
  // ease so changes are gentle around each keyframe
  const e = t * t * (3 - 2 * t)
  return {
    top: mix(a.top, b.top, e),
    mid: mix(a.mid, b.mid, e),
    low: mix(a.low, b.low, e),
    stars: a.stars + (b.stars - a.stars) * e,
    glow: a.glow + (b.glow - a.glow) * e,
  }
}

export function phaseName(minutes) {
  if (minutes < 270 || minutes >= 1170) return 'night'
  if (minutes < 330) return 'before dawn'
  if (minutes < 400) return 'dawn'
  if (minutes < 1040) return 'day'
  return 'dusk'
}

export function formatClock(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Fixed star field (seeded, so it never jumps between renders).
export const STARS = (() => {
  let s = 7
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: 140 }, () => ({
    x: rnd() * 100,
    y: Math.pow(rnd(), 1.4) * 78, // denser towards the top
    r: rnd() < 0.08 ? 1.3 : 0.45 + rnd() * 0.55,
    o: 0.35 + rnd() * 0.65,
  }))
})()
