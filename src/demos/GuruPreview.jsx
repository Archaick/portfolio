import { useEffect, useState } from 'react'
import './GuruPreview.css'

// A very small, self-playing glimpse of Tadarus Guru (the Belajar 5T app),
// pinned to where the teacher is on the globe. One short story, on a loop:
// a teacher logs in → gets a question → answers it → all five 5T stars light
// up. Demo only: no real teacher, school or data.

const STARS = ['#f08a3c', '#f4ad3a', '#fbc94f', '#f2725b', '#e8577e'] // Tamhid … Tazkiyah
const ARC = [[10, 22], [30, 13], [50, 9], [70, 13], [90, 22]]
const QUESTION = { word: 'الْحَمْدُ', options: ['Segala puji', 'Ampunan'], answer: 0 }

// each phase and how long it stays (ms)
const PHASES = [
  ['login', 1600],
  ['question', 1500],
  ['tap', 700],
  ['right', 1700], // the stars light one by one here
  ['done', 3200],
]

export default function GuruPreview({ below = false }) {
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [p, setP] = useState(still ? 4 : 0)
  const [lit, setLit] = useState(still ? 5 : 0)
  const phase = PHASES[p][0]

  useEffect(() => {
    if (still) return undefined
    const id = setTimeout(() => setP((n) => (n + 1) % PHASES.length), PHASES[p][1])
    return () => clearTimeout(id)
  }, [p, still])

  // the five stars light up one after another once the answer is right
  useEffect(() => {
    if (still) return undefined
    if (phase === 'login') setLit(0)
    if (phase !== 'right') return undefined
    const id = setInterval(() => setLit((n) => Math.min(5, n + 1)), 260)
    return () => clearInterval(id)
  }, [phase, still])

  const answered = phase === 'right' || phase === 'done'

  return (
    <div className={`gp ${below ? 'below' : ''}`} lang="id" aria-label="Tadarus Guru: contoh guru yang sedang belajar">
      <svg viewBox="0 0 100 30" className="gp-stars" aria-hidden="true">
        {STARS.map((color, i) => (
          <g key={color} transform={`translate(${ARC[i][0]} ${ARC[i][1]})`} className={`gp-star ${i < lit ? 'lit' : ''}`}>
            <circle r="7" fill={color} className="gp-halo" />
            <g className="gp-glint">
              <rect x="-8" y="-0.3" width="16" height="0.6" fill="#fff" />
              <rect x="-0.3" y="-8" width="0.6" height="16" fill="#fff" />
            </g>
            <circle r="1.9" fill="#fff" className="gp-core" />
          </g>
        ))}
      </svg>

      <div className="gp-text">
        {phase === 'login' && (
          <div className="gp-login" key="login">
            <span className="gp-avatar" aria-hidden="true">G</span>
            <div>
              <strong>Guru masuk</strong>
              <small>Tadarus Guru · Jakarta</small>
            </div>
          </div>
        )}

        {(phase === 'question' || phase === 'tap' || phase === 'right') && (
          <div className="gp-quiz" key="quiz">
            <p className="gp-q">
              Arti <span lang="ar" dir="rtl">{QUESTION.word}</span>?
            </p>
            <div className="gp-opts">
              {QUESTION.options.map((o, k) => {
                const isAnswer = k === QUESTION.answer
                const cls = isAnswer && phase === 'tap' ? 'tapped' : isAnswer && answered ? 'right' : answered ? 'dim' : ''
                return (
                  <span key={o} className={`gp-opt ${cls}`}>
                    {isAnswer && answered && <b aria-hidden="true">✓ </b>}
                    {o}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="gp-done" key="done">
            <strong>Masya Allah!</strong>
            <small>5 bintang menyala</small>
          </div>
        )}
      </div>
    </div>
  )
}
