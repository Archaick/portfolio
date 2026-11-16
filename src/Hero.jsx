import { useEffect, useState } from 'react'
import { STARS, formatClock, jakartaMinutes, phaseName, skyAt } from './sky'
import { profile } from './content'
import portrait from './assets/saeed.webp'

// ?t=05:40 in the URL previews the sky at a given Jakarta time.
function overrideMinutes() {
  const t = new URLSearchParams(window.location.search).get('t')
  const m = t && /^(\d{1,2}):(\d{2})$/.exec(t)
  return m ? (Number(m[1]) % 24) * 60 + (Number(m[2]) % 60) : null
}

function useJakartaTime() {
  const [minutes, setMinutes] = useState(() => overrideMinutes() ?? jakartaMinutes())
  useEffect(() => {
    if (overrideMinutes() !== null) return
    const id = setInterval(() => setMinutes(jakartaMinutes()), 30_000)
    return () => clearInterval(id)
  }, [])
  return minutes
}

export default function Hero() {
  const minutes = useJakartaTime()
  const sky = skyAt(minutes)

  return (
    <header
      className="hero"
      style={{
        '--sky-top': sky.top,
        '--sky-mid': sky.mid,
        '--sky-low': sky.low,
        '--glow': sky.glow,
      }}
    >
      <svg className="stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff" opacity={s.o * sky.stars} />
        ))}
      </svg>
      <div className="horizon" aria-hidden="true" />

      <div className="hero-inner">
        <p className="sky-label">
          <span className="dot" aria-hidden="true" />
          Sky over Jakarta · {formatClock(minutes)} WIB · {phaseName(minutes)}
        </p>
        <div className="name-row">
          <img className="portrait" src={portrait} alt={profile.name} width="160" height="160" />
          <h1>{profile.name}</h1>
        </div>
        <p className="lede">{profile.line}</p>
        <p className="sub">{profile.sub}</p>
        <div className="actions">
          <a className="btn btn-gold" href={`mailto:${profile.email}`}>Email me</a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <a className="scroll-hint" href="#work">See the work ↓</a>
    </header>
  )
}
