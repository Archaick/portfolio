import { Suspense, lazy, useEffect } from 'react'
import Hero from './Hero'
import {
  education, experience, languages, partnerships, profile, projects, skills, smallBuilds,
} from './content'

const JisrQuiz = lazy(() => import('./demos/JisrQuiz'))
const TadarusGlobe = lazy(() => import('./demos/TadarusGlobe'))
const CertVerify = lazy(() => import('./demos/CertVerify'))
const DEMOS = { quiz: JisrQuiz, globe: TadarusGlobe, cert: CertVerify }

function Demo({ p }) {
  const Live = DEMOS[p.demo]
  if (!Live) return <BrowserFrame host={p.host} name={p.name} />
  return (
    <div className="demo">
      <p className="demo-tag"><span className="dot" aria-hidden="true" /> Try it — live sample</p>
      <Suspense fallback={<div className="demo-loading">Loading {p.name}…</div>}>
        <Live />
      </Suspense>
    </div>
  )
}

const LOGOS = import.meta.glob('./assets/partners/*.webp', { eager: true, import: 'default' })
const logoOf = (key) => LOGOS[`./assets/partners/${key}.webp`]

function Partner({ p }) {
  return (
    <div className="partner">
      <div className="logo">
        {p.logo ? <img src={logoOf(p.logo)} alt={`${p.name} logo`} loading="lazy" /> : <span lang="ar" dir="rtl">{p.ar}</span>}
      </div>
      <strong>{p.name}</strong>
      <small>{p.place}</small>
    </div>
  )
}

function BrowserFrame({ host, name }) {
  // Placeholder until real (demo-data) screenshots are added.
  return (
    <div className="frame" aria-hidden="true">
      <div className="frame-bar">
        <span /><span /><span />
        <em>{host}</em>
      </div>
      <div className="frame-body">
        <strong>{name}</strong>
        <small>Screenshot coming soon</small>
      </div>
    </div>
  )
}

function Project({ p, index }) {
  return (
    <article className={`project ${index % 2 ? 'flip' : ''}`} id={p.id}>
      <div className="project-text">
        <p className="eyebrow">{p.flag}</p>
        <h3>{p.name}</h3>
        <p className="tagline">{p.tagline}</p>

        {p.stat && (
          <div className="stat">
            <span className="stat-value">{p.stat.value}</span>
            <span className="stat-label">{p.stat.label}</span>
          </div>
        )}

        <h4>The problem</h4>
        <p>{p.problem}</p>
        <h4>What I built</h4>
        <ul className="ticks">
          {p.built.map((b) => <li key={b}>{b}</li>)}
        </ul>
        <ul className="chips">
          {p.stack.map((s) => <li key={s}>{s}</li>)}
        </ul>
        {p.url && (
          <a className="btn btn-gold" href={p.url} target="_blank" rel="noreferrer">
            Visit live ↗
          </a>
        )}
      </div>
      <Demo p={p} />
    </article>
  )
}

// Each block below the hero rises gently into view the first time it is scrolled to.
const REVEAL = 'main h2, main .section-lede, .project-text, .project > .demo, .project > .frame, .partners li, .two-col > div, .contact .actions'

function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll(REVEAL)]
    if (!('IntersectionObserver' in window)) return undefined
    els.forEach((el) => {
      el.classList.add('reveal')
      // cards in a row follow one another
      const row = el.matches('.partners li') ? [...el.parentNode.children].indexOf(el) : el.matches('.project > *') ? 1 : 0
      if (row) el.style.transitionDelay = `${row * 0.12}s`
    })
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('in')
        io.unobserve(e.target)
      }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function App() {
  useReveal()
  return (
    <>
      <Hero />
      <main>
        <section id="work" className="section">
          <h2>Selected work</h2>
          <p className="section-lede">
            I design, build and run every one of these myself, from the database rules to the
            last right-to-left Arabic label.
          </p>
          {projects.map((p, i) => <Project key={p.id} p={p} index={i} />)}

          {smallBuilds.length > 0 && <div className="small-builds">
            {smallBuilds.map((b) => (
              <div key={b.name} className="card">
                <h3>{b.name}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>}
        </section>

        <section className="section">
          <h2>Bringing institutions together</h2>
          <p className="section-lede">
            Beyond the code, I bring institutions in Indonesia, Saudi Arabia and Türkiye together.
            Agreements I facilitated:
          </p>
          <ul className="partners">
            {partnerships.map((x) => (
              <li key={x.a.name + x.b.name}>
                <div className="pair">
                  <Partner p={x.a} />
                  <span className="link" aria-hidden="true"><i /></span>
                  <Partner p={x.b} />
                </div>
                <span className="kind">{x.kind}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section two-col">
          <div>
            <h2>Experience</h2>
            <ul className="timeline">
              {experience.map((e) => (
                <li key={e.org}>
                  <span className="when">{[e.when, e.where].filter(Boolean).join(' · ')}</span>
                  <strong>{e.role}</strong>
                  <span>{e.org}</span>
                  {e.note && <small>{e.note}</small>}
                </li>
              ))}
            </ul>
            <h2 className="mt">Education</h2>
            <ul className="timeline">
              {education.map((e) => (
                <li key={e.name}>
                  {e.when && <span className="when">{e.when}</span>}
                  <strong>{e.name}</strong>
                  <span>{e.org}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Skills</h2>
            <ul className="chips big">
              {skills.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <h2 className="mt">Languages</h2>
            <ul className="langs">
              {languages.map((l) => (
                <li key={l.name}><strong>{l.name}</strong><span>{l.level}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="section contact">
          <h2>Let’s build something that teaches</h2>
          <p className="section-lede">
            Open to projects, partnerships and institutions working in education.
          </p>
          <div className="actions center">
            <a className="btn btn-gold" href={`mailto:${profile.email}`}>{profile.email}</a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <p className="sign-off">© {new Date().getFullYear()} {profile.name} · Jakarta, Indonesia</p>
        </section>
      </main>
    </>
  )
}
