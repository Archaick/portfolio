import Hero from './Hero'
import {
  education, experience, languages, partnerships, profile, projects, skills, smallBuilds,
} from './content'

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
      <BrowserFrame host={p.host} name={p.name} />
    </article>
  )
}

export default function App() {
  return (
    <>
      <Hero />
      <main>
        <section id="work" className="section">
          <h2>Selected work</h2>
          <p className="section-lede">
            I design, build and run every one of these myself — from the database rules to the
            last right-to-left Arabic label.
          </p>
          {projects.map((p, i) => <Project key={p.id} p={p} index={i} />)}

          <div className="small-builds">
            {smallBuilds.map((b) => (
              <div key={b.name} className="card">
                <h3>{b.name}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Bringing institutions together</h2>
          <p className="section-lede">
            Alongside the code, I coordinate partners across Indonesia, Saudi Arabia and Türkiye.
            Agreements I facilitated:
          </p>
          <ul className="partners">
            {partnerships.map((x) => (
              <li key={x.a}>
                <span className="p-a">{x.a}</span>
                <span className="p-line" aria-hidden="true" />
                <span className="p-b">{x.b}</span>
                <small>{x.kind}</small>
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
        </section>
      </main>
      <footer>© {new Date().getFullYear()} {profile.name} · Jakarta, Indonesia</footer>
    </>
  )
}
