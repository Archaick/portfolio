import { Suspense, lazy, useEffect, useRef } from 'react'
import Hero from './Hero'
import DustField from './DustField'
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
          <a className="btn btn-light" href={p.url} target="_blank" rel="noreferrer">
            Visit live ↗
          </a>
        )}
      </div>
      <Demo p={p} />
    </article>
  )
}

// Each block below the hero rises gently into view the first time it is scrolled to.
const REVEAL = 'main .section-lede, .project-text, .project > .demo, .project > .frame, .partners li, .two-col > div, .contact .actions'

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

const ROOM_BEAM = { from: [0.95, -0.2], to: [0.2, 1.2], strength: 10 }

// The beam swings to light whichever project is in the middle of the screen; the others dim.
function useSpotlight(steer) {
  useEffect(() => {
    const projects = [...document.querySelectorAll('.project')]
    const main = document.querySelector('main')
    let raf = 0
    let lit = null
    const update = () => {
      raf = 0
      const vh = innerHeight
      const vw = innerWidth
      let best = null
      let bestD = Infinity
      for (const el of projects) {
        const r = el.getBoundingClientRect()
        if (r.bottom < vh * 0.2 || r.top > vh * 0.8) continue
        const d = Math.abs(r.top + r.height / 2 - vh / 2)
        if (d < bestD) {
          bestD = d
          best = el
        }
      }
      if (best !== lit) {
        lit?.classList.remove('lit')
        best?.classList.add('lit')
        main.classList.toggle('spot', !!best)
        lit = best
      }
      if (!best) {
        steer.current = ROOM_BEAM
        return
      }
      // aim at the live demo when there is one, else the whole card
      const target = best.querySelector('.demo, .frame') || best
      const r = target.getBoundingClientRect()
      const cx = (r.left + r.width / 2) / vw
      const cy = Math.min(0.85, Math.max(0.2, (r.top + r.height / 2) / vh))
      const fx = cx > 0.5 ? Math.min(1.05, cx + 0.3) : Math.max(-0.05, cx - 0.3)
      const from = [fx, -0.25]
      steer.current = { from, to: [cx + (cx - fx) * 0.5, cy + (cy - from[1]) * 0.5], strength: 46 }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steer])
}

// Each section title forms out of dust the first time it scrolls into view.
function useDustTitles(dust) {
  useEffect(() => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (still || !('IntersectionObserver' in window)) return undefined
    const titles = [...document.querySelectorAll('main h2')]
    titles.forEach((h) => h.classList.add('dust-wait'))
    const show = (h) => {
      h.classList.remove('dust-wait')
      h.classList.add('dust-in')
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return
        const h = e.target
        io.unobserve(h)
        const safety = setTimeout(() => show(h), 2500) // never leave a title hidden
        const run = dust.current?.gatherInto(h) ?? Promise.resolve()
        run.then(() => {
          clearTimeout(safety)
          show(h)
        })
      }),
      { rootMargin: '0px 0px -15% 0px', threshold: 0.6 },
    )
    titles.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [dust])
}

export default function App() {
  const steer = useRef(ROOM_BEAM)
  const dust = useRef(null)
  useReveal()
  useSpotlight(steer)
  useDustTitles(dust)
  return (
    <>
      <div className="page-dust" aria-hidden="true">
        <DustField beam={ROOM_BEAM} density={0.55} beamStrength={10} steer={steer} api={dust} />
      </div>
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
          <div className="closing-room" aria-hidden="true" />
          <h2>Let’s build something that teaches</h2>
          <p className="section-lede">
            Open to projects, partnerships and institutions working in education.
          </p>
          <div className="actions center">
            <a className="btn btn-light" href={`mailto:${profile.email}`}>{profile.email}</a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <p className="sign-off">© {new Date().getFullYear()} {profile.name} · Jakarta, Indonesia</p>
        </section>
      </main>
    </>
  )
}
