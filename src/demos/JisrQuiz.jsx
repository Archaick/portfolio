import { useState } from 'react'
import jisrTile from '../jisr-tile.svg'
import './JisrQuiz.css'

// A small, playable copy of a JISR practice (the real one is at ar-jisr.web.app):
// pick the Arabic word, see right / wrong, move on, finish with a score.
const QUESTIONS = [
  { q: 'Which Arabic word means “Pencipta” (Creator)?', options: ['إِلَٰهٌ', 'خَالِقٌ', 'مَخْلُوقٌ'], answer: 1 },
  { q: 'Which Arabic word means “Ilmu” (Knowledge)?', options: ['عِلْمٌ', 'عَمَلٌ', 'قَلْبٌ'], answer: 0 },
  { q: 'Which Arabic word means “Shalat” (Prayer)?', options: ['صَوْمٌ', 'زَكَاةٌ', 'صَلَاةٌ'], answer: 2 },
]
const LETTERS = ['A', 'B', 'C']

export default function JisrQuiz() {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const done = i >= QUESTIONS.length
  const item = QUESTIONS[i]
  const checked = picked !== null
  const right = checked && picked === item.answer
  const progress = ((i + (checked ? 1 : 0)) / QUESTIONS.length) * 100

  const pick = (k) => {
    if (checked) return
    setPicked(k)
    if (k === item.answer) setScore((s) => s + 1)
  }
  const next = () => {
    setPicked(null)
    setI((n) => n + 1)
  }
  const restart = () => {
    setI(0)
    setPicked(null)
    setScore(0)
  }

  return (
    <div className="jq" role="group" aria-label="Try a JISR practice">
      <div className="jq-chrome">
        <span /><span /><span />
        <em><img src={jisrTile} alt="" /> ar-jisr.web.app</em>
      </div>

      <div className="jq-body">
        <div className="jq-top">
          <div className="jq-bar"><div style={{ width: `${done ? 100 : progress}%` }} /></div>
          <img src={jisrTile} alt="JISR" className="jq-logo" />
        </div>

        {done ? (
          <div className="jq-done">
            <p className="jq-big">{score === QUESTIONS.length ? 'Masya Allah!' : 'Good effort!'}</p>
            <p>You got <strong>{score} of {QUESTIONS.length}</strong> right.</p>
            <p className="jq-small">Real JISR lessons build vocabulary like this from the Qur’an, hadith and daily du’a.</p>
            <div className="jq-done-actions">
              <button type="button" className="jq-btn" onClick={restart}>Play again</button>
              <a className="jq-btn jq-btn-ghost" href="https://ar-jisr.web.app" target="_blank" rel="noreferrer">Open JISR ↗</a>
            </div>
          </div>
        ) : (
          <>
            <p className="jq-q" aria-live="polite">{item.q}</p>
            <div className="jq-options">
              {item.options.map((word, k) => {
                const state = !checked ? '' : k === item.answer ? 'is-right' : k === picked ? 'is-wrong' : 'is-dim'
                return (
                  <button
                    key={word}
                    type="button"
                    className={`jq-opt ${state}`}
                    onClick={() => pick(k)}
                    disabled={checked}
                  >
                    <span className="jq-letter">{LETTERS[k]}</span>
                    <span className="jq-word" lang="ar" dir="rtl">{word}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {checked && !done && (
        <div className={`jq-sheet ${right ? 'ok' : 'no'}`} aria-live="polite">
          <div>
            <strong>{right ? 'Great!' : 'Not quite'}</strong>
            <span>{right ? 'Correct answer' : <>The answer is <b lang="ar">{item.options[item.answer]}</b></>}</span>
          </div>
          <button type="button" className="jq-btn" onClick={next}>
            {i === QUESTIONS.length - 1 ? 'See result' : 'Continue'}
          </button>
        </div>
      )}
      <p className="jq-hint">Tap an answer — this is a working sample</p>
    </div>
  )
}
