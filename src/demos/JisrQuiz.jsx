import { useState } from 'react'
import jisrTile from '../jisr-tile.svg'
import JisriBuddy from '../jisri/JisriBuddy'
import '../jisri/jisri.css'
import './JisrQuiz.css'

// A small, playable copy of a JISR practice (the real one is at ar-jisr.web.app),
// in Indonesian like the app: Jisri asks, you pick the Arabic word, he cheers or
// gently says "not yet", and at the end he celebrates your score.
const QUESTIONS = [
  { q: 'Apa bahasa Arab “Pencipta”?', options: ['إِلَٰهٌ', 'خَالِقٌ', 'مَخْلُوقٌ'], answer: 1 },
  { q: 'Apa bahasa Arab “Ilmu”?', options: ['عِلْمٌ', 'عَمَلٌ', 'قَلْبٌ'], answer: 0 },
  { q: 'Apa bahasa Arab “Shalat”?', options: ['صَوْمٌ', 'زَكَاةٌ', 'صَلَاةٌ'], answer: 2 },
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
  const perfect = score === QUESTIONS.length

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
    <div className="jq" role="group" aria-label="Coba latihan JISR" lang="id">
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
            <JisriBuddy key="end" mood={perfect ? 'celebrate' : 'bow'} size={96} className="jq-jisri-end" />
            <p className="jq-big">{perfect ? 'Masya Allah, sempurna!' : 'Bagus, terus belajar!'}</p>
            <p>Kamu menjawab <strong>{score} dari {QUESTIONS.length}</strong> dengan benar.</p>
            <p className="jq-small">Di JISR, kosakata seperti ini diambil langsung dari Al-Qur’an, hadis, dan doa sehari-hari.</p>
            <div className="jq-done-actions">
              <button type="button" className="jq-btn" onClick={restart}>Main lagi</button>
              <a className="jq-btn jq-btn-ghost" href="https://ar-jisr.web.app" target="_blank" rel="noreferrer">Buka JISR ↗</a>
            </div>
          </div>
        ) : (
          <>
            <div className="jq-ask">
              <JisriBuddy
                key={`${i}-${checked}`}
                mood={!checked ? 'idle' : right ? 'happy' : 'down'}
                talking={!checked}
                size={64}
                className="jq-jisri"
              />
              <p className="jq-q" aria-live="polite">{item.q}</p>
            </div>
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
          <div className="jq-sheet-text">
            <JisriBuddy key={`s${i}`} mood={right ? 'happy' : 'sad'} size={52} className="jq-jisri" />
            <div>
              <strong>{right ? 'Hebat!' : 'Belum tepat'}</strong>
              <span>{right ? 'Jawaban benar' : <>Jawabannya <b lang="ar">{item.options[item.answer]}</b></>}</span>
            </div>
          </div>
          <button type="button" className="jq-btn" onClick={next}>
            {i === QUESTIONS.length - 1 ? 'Lihat hasil' : 'Lanjut'}
          </button>
        </div>
      )}
      <p className="jq-hint">Ketuk jawaban — ini contoh yang bisa dicoba</p>
    </div>
  )
}
