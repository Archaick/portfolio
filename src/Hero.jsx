import { useRef, useState } from 'react'
import { profile } from './content'
import portrait from './assets/saeed.webp'
import DustField from './DustField'
import { shouldPlayIntro } from './intro'

// The opening: a dark room, a beam of light switches on, and the dust floating in it
// gathers into the headline before the real (glass) text appears. Esc skips it;
// ?intro=0 turns it off; reduced motion shows the finished page straight away.
export default function Hero() {
  const headline = useRef(null)
  const [phase, setPhase] = useState(() => (shouldPlayIntro() ? 'gather' : 'still'))
  const [progress, setProgress] = useState(0)

  return (
    <header className={`hero is-${phase}`}>
      <div className="beam-source" aria-hidden="true" />
      <div className="planet" aria-hidden="true" />
      <DustField
        gather={phase === 'gather' ? headline : null}
        onProgress={setProgress}
        onReveal={() => setPhase('reveal')}
        onDone={() => setPhase('still')}
      />

      <div className="hero-inner">
        <p className="hero-meta">
          <img className="portrait" src={portrait} alt={profile.name} width="160" height="160" />
          <span>
            <strong>{profile.name}</strong>
            <em>Founder-developer · Jakarta</em>
          </span>
        </p>

        <h1 className="mega" ref={headline}>
          <span data-line>{profile.headline[0]}</span>
          <span data-line className="dim">{profile.headline[1]}</span>
        </h1>

        <p className="sub">{profile.sub}</p>
        <div className="actions">
          <a className="btn btn-light" href={`mailto:${profile.email}`}>Email me</a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <a className="scroll-hint" href="#work">See the work ↓</a>

      {phase === 'gather' && (
        <div className="loading" role="progressbar" aria-label="Loading" aria-valuenow={Math.round(progress * 100)}>
          <div className="loading-bar"><i style={{ transform: `scaleX(${progress})` }} /></div>
          <span>Loading <em>{Math.round(progress * 100)}%</em></span>
        </div>
      )}
    </header>
  )
}
