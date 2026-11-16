import { useEffect, useState } from 'react'
import { STARS, jakartaMinutes, skyAt } from './sky'
import { profile } from './content'
import portrait from './assets/saeed.webp'
import FallIntro from './FallIntro'
import { gentleIntro, shouldPlayIntro } from './intro'

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
  // 'fall' (the opening plays) → 'land' (the hero settles in) → 'still'
  const [phase, setPhase] = useState(() => (shouldPlayIntro() ? 'fall' : 'still'))
  useEffect(() => {
    if (phase !== 'land') return undefined
    const id = setTimeout(() => setPhase('still'), 1400)
    return () => clearTimeout(id)
  }, [phase])

  return (
    <header
      className={`hero is-${phase}`}
      style={{
        '--sky-top': sky.top,
        '--sky-mid': sky.mid,
        '--sky-low': sky.low,
        '--glow': sky.glow,
      }}
    >
      <svg className="stars" aria-hidden="true" opacity={sky.stars}>
        <defs>
          <linearGradient id="glint-h">
            <stop offset="0" stopColor="#fff8e1" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff8e1" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff8e1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glint-v" x2="0" y2="1">
            <stop offset="0" stopColor="#fff8e1" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff8e1" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff8e1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {STARS.map((s, i) => {
          const style = s.shimmer
            ? { '--o': s.o, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }
            : undefined
          return (
            <g key={i} className={s.shimmer ? 'star shimmer' : 'star'} style={style} opacity={s.shimmer ? undefined : s.o}>
              {s.glint && (
                <>
                  <rect x={`${s.x}%`} y={`${s.y}%`} width="14" height="0.8" transform="translate(-7 -0.4)" fill="url(#glint-h)" />
                  <rect x={`${s.x}%`} y={`${s.y}%`} width="0.8" height="14" transform="translate(-0.4 -7)" fill="url(#glint-v)" />
                </>
              )}
              <circle cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#fff" />
            </g>
          )
        })}
      </svg>
      <div className="horizon" aria-hidden="true" />

      <div className="hero-inner">
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
      {phase === 'fall' && <FallIntro skyTop={sky.top} skyMid={sky.mid} skyLow={sky.low} glow={sky.glow} gentle={gentleIntro()} onDone={() => setPhase('land')} />}
    </header>
  )
}
