import { useEffect, useRef, useState } from 'react'
import './CertVerify.css'

// Markaz Al-Hijaz certificate verification, as a short self-playing scene:
// a printed certificate → a phone slides in and scans its QR code → the
// phone opens markazalhijaz.org/verify/<code> and shows it is genuine.
// Demo data only ("Fulan bin Fulan" is the Arabic "so-and-so").

const CODE = '7Q4K2M'
const PHASES = [
  ['paper', 1300],
  ['phone', 900],
  ['scan', 1500],
  ['check', 900],
  ['verified', 3800],
]

// a QR-like pattern: three finder squares and fixed pseudo-random modules
const N = 21
const QR = (() => {
  let s = 42
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const finder = (x, y) =>
    [[0, 0], [14, 0], [0, 14]].some(([fx, fy]) => {
      const dx = x - fx
      const dy = y - fy
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null
      return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
    })
  const inFinderZone = (x, y) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
  let d = ''
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const on = inFinderZone(x, y) ? finder(x, y) : rnd() < 0.48
      if (on) d += `M${x} ${y}h1v1h-1z`
    }
  }
  return d
})()

function QrCode({ className }) {
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} className={className} aria-hidden="true" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      <path d={QR} fill="#14213d" />
    </svg>
  )
}

export default function CertVerify() {
  const box = useRef(null)
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [p, setP] = useState(still ? 4 : 0)
  const [onScreen, setOnScreen] = useState(false)
  const phase = PHASES[p][0]

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 })
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (still || !onScreen) return undefined
    const id = setTimeout(() => setP((n) => (n + 1) % PHASES.length), PHASES[p][1])
    return () => clearTimeout(id)
  }, [p, still, onScreen])

  const phoneIn = phase !== 'paper'
  const scanning = phase === 'phone' || phase === 'scan'

  return (
    <div ref={box} className={`cv is-${phase}`} role="img" aria-label="A phone scans the QR code on a printed Markaz Al-Hijaz certificate and the website confirms it is genuine.">
      {/* the printed certificate */}
      <div className="cv-paper">
        <div className="cv-paper-inner">
          <p className="cv-org">Markaz Al-Hijaz</p>
          <p className="cv-title">Sertifikat</p>
          <p className="cv-small">diberikan kepada</p>
          <p className="cv-name">Fulan bin Fulan</p>
          <p className="cv-small">atas kelulusan program</p>
          <p className="cv-prog">Bahasa Arab Dasar</p>
          <div className="cv-foot">
            <div className="cv-sign">
              <svg viewBox="0 0 60 20" aria-hidden="true"><path d="M2 14 C10 2, 14 18, 22 9 S34 4, 38 12 S50 16, 58 6" /></svg>
              <span>Direktur</span>
            </div>
            <div className="cv-stamp" aria-hidden="true">MAH</div>
            <div className="cv-qr-wrap">
              <QrCode className="cv-qr" />
              <span>{CODE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* the phone */}
      <div className={`cv-phone ${phoneIn ? 'in' : ''}`}>
        <div className="cv-notch" />
        <div className="cv-screen">
          {scanning && (
            <div className="cv-camera">
              <p className="cv-cam-hint">Arahkan ke kode QR</p>
              <div className={`cv-viewfinder ${phase === 'scan' ? 'locked' : ''}`}>
                <QrCode className="cv-qr-big" />
                <i className="cv-corner tl" /><i className="cv-corner tr" /><i className="cv-corner bl" /><i className="cv-corner br" />
                <span className="cv-beam" />
              </div>
            </div>
          )}
          {phase === 'check' && (
            <div className="cv-checking">
              <span className="cv-url">markazalhijaz.org/verify/{CODE}</span>
              <span className="cv-spin" aria-hidden="true" />
              <p>Memeriksa sertifikat…</p>
            </div>
          )}
          {phase === 'verified' && (
            <div className="cv-ok">
              <span className="cv-url">markazalhijaz.org/verify/{CODE}</span>
              <div className="cv-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </div>
              <p className="cv-ok-title">Sertifikat Asli</p>
              <p className="cv-ok-sub">Terverifikasi · Markaz Al-Hijaz</p>
              <dl>
                <dt>Nama</dt><dd>Fulan bin Fulan</dd>
                <dt>Program</dt><dd>Bahasa Arab Dasar</dd>
                <dt>Kode</dt><dd>{CODE}</dd>
              </dl>
              <p className="cv-live"><i /> Dicek langsung dari database</p>
            </div>
          )}
          {phase === 'paper' && <div className="cv-idle" />}
        </div>
      </div>
    </div>
  )
}
