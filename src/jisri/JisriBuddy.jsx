import { useId } from 'react'

// ── Jisri the book, as a character (owner, 28 Oct 2026: "only the book but
// with more character … his expression changes for true / false … the
// completion … like Duolingo … in glassmorphism") ──────────────────
// A glossy glass book (cream pages behind; no mark on its face — owner) with
// arms, feet and a face that moves with the moment:
//   idle      — springy breathing and a little hop, blinking (the greeting;
//               `talking` moves the mouth and waves)
//   happy     — a correct answer: a squashy jump, ^ ^ eyes, a big smile,
//               arms up, sparkles
//   sad       — a wrong answer: a "no" shake, > < eyes with big tears and a
//               wobbly little mouth (sticker-cute, like Cuppy — owner)
//   celebrate — a finished page (owner, 28 Oct 2026: "the flip is not
//               attractive"): happy bouncing jumps with both arms up, a golden
//               glow turning behind, a star popping above, confetti bursting
//               out — no spin
//   angry     — cute-grumpy, like Duolingo's owl (owner, 28 Oct 2026): V brows,
//               squinted eyes, a pout, his cover flushing red, steam puffs and
//               an anger mark, a stomp with shaking fists
// 28 Oct 2026 (owner: "users may not tell he's a book on white pages"): the
// pages show their edge and lines, a spine crease runs down the cover and a
// red bookmark ribbon hangs below. `cap` puts a graduation cap on him, its
// tassel swinging.
// 29 Oct 2026 (owner: "make the new 4 … and one sad, not crying"):
//   reading  — an open book in his hands, eyes running along the lines, a
//              page turning now and then (the e-book)
//   thinking — a hand at his chin, eyes up, one brow raised, a "?" bubbling
//              above (asking a question)
//   bow      — takes a bow, eyes closed and smiling, sparkles (a perfect score)
//   sleepy   — eyes shut, a small "o" mouth, z z Z drifting up, slow breaths
//              (has not come back for a while)
//   down     — sad without tears: worried brows, eyes down, a small frown,
//              a slow sigh (a kind "not yet")
// `loop` (the grade cards): the happy jump again and again, with a rest.
// The motion lives in index.css (.jbd-*); still for reduced motion.

// confetti bursting out from behind Jisri: [angle°, distance, colour, delay s]
const BURST = [[-160, 70, '#f7c23e', 0], [-130, 82, '#5b8cff', 0.1], [-100, 76, '#34d399', 0.2], [-75, 84, '#fb7185', 0.05],
  [-50, 78, '#a78bfa', 0.15], [-20, 72, '#f7c23e', 0.25], [-145, 58, '#fb7185', 0.3], [-35, 60, '#5b8cff', 0.35],
  [-115, 64, '#a78bfa', 0.4], [-62, 66, '#34d399', 0.45]]
const RAYS = Array.from({ length: 12 }, (_, i) => i * 30)
const SPARKS = [[18, 40, 0], [118, 34, 0.12], [10, 84, 0.24], [128, 80, 0.06]]

export default function JisriBuddy({ mood = 'idle', talking = false, loop = false, cap = false, size = 120, className = '' }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (k) => `jbd${raw}-${k}`
  const happyFace = mood === 'happy' || mood === 'celebrate'
  const closedSmile = mood === 'bow'
  return (
    <svg viewBox="0 0 140 160" width={size} height={size * (160 / 140)} overflow="visible" aria-hidden="true"
      className={`jbd jbd-${mood} ${talking ? 'jbd-talk' : ''} ${loop ? 'jbd-loop' : ''} ${className}`}>
      <defs>
        <linearGradient id={id('c')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7fa8ff" /><stop offset="1" stopColor="#2a52d1" /></linearGradient>
        <linearGradient id={id('g')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id={id('k')} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ff8fb0" stopOpacity=".9" /><stop offset="1" stopColor="#ff8fb0" stopOpacity="0" /></radialGradient>
        <radialGradient id={id('sun')} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff3b0" stopOpacity=".95" /><stop offset=".55" stopColor="#ffd56a" stopOpacity=".45" /><stop offset="1" stopColor="#ffd56a" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="jbd-shadow" cx="70" cy="148" rx="34" ry="5" fill="#0b2244" opacity=".16" />

      {mood === 'celebrate' && (
        <g>
          {/* a golden glow with slow-turning rays behind him */}
          <circle cx="67" cy="78" r="74" fill={`url(#${id('sun')})`} />
          <g className="jbd-rays">{RAYS.map(a => <path key={a} d="M67 78 L63 6 L71 6 Z" fill="#ffd56a" opacity=".35" transform={`rotate(${a} 67 78)`} />)}</g>
          {/* confetti bursting out */}
          {BURST.map(([a, dist, c, d], i) => (
            <rect key={i} className="jbd-burst" x="64" y="62" width="6" height="10" rx="2" fill={c}
              style={{ '--dx': `${Math.round(Math.cos(a * Math.PI / 180) * dist)}px`, '--dy': `${Math.round(Math.sin(a * Math.PI / 180) * dist)}px`, animationDelay: `${d}s` }} />
          ))}
          {/* a star popping above */}
          <path className="jbd-star" d="M67 0 L72.5 11 L84.5 12.5 L75.5 20.5 L78 32.5 L67 26.5 L56 32.5 L58.5 20.5 L49.5 12.5 L61.5 11 Z" fill="#ffc83d" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </g>
      )}
      {mood === 'thinking' && (
        <g className="jbd-q">
          {/* a thought bubble with a "?" */}
          <circle cx="104" cy="44" r="3" fill="#fff" stroke="#c9d6f5" strokeWidth="1.5" />
          <circle cx="110" cy="34" r="4.5" fill="#fff" stroke="#c9d6f5" strokeWidth="1.5" />
          <circle cx="122" cy="16" r="14" fill="#fff" stroke="#c9d6f5" strokeWidth="2" />
          <path d="M117 12 Q117 6 122.5 6 Q128 6 128 11.5 Q128 15 123.5 16.5 L123 20" stroke="#2a52d1" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="123" cy="25" r="2" fill="#2a52d1" />
        </g>
      )}
      {mood === 'sleepy' && (
        <g fill="#5b7fd6" fontFamily="system-ui, sans-serif" fontWeight="900">
          <text className="jbd-z" x="96" y="40" fontSize="13">z</text>
          <text className="jbd-z jbd-z2" x="106" y="28" fontSize="17">z</text>
          <text className="jbd-z jbd-z3" x="117" y="14" fontSize="22">Z</text>
        </g>
      )}
      {(mood === 'happy' || mood === 'bow') && SPARKS.map(([x, y, d], i) => (
        <path key={i} className="jbd-spark" d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill="#f7c23e" style={{ animationDelay: `${d}s` }} />
      ))}

      <g className="jbd-body">
        {/* feet */}
        <ellipse cx="54" cy="134" rx="11" ry="6.5" fill="#13306e" /><ellipse cx="84" cy="134" rx="11" ry="6.5" fill="#13306e" />
        {/* pages behind, then the glass cover */}
        <path d="M99 120 V148 L104 143 L109 148 V120 Z" fill="#e64a5c" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="33" y="41" width="85" height="92" rx="20" fill="#fff6dc" stroke="#cdb57a" strokeWidth="2" />
        <path d="M113 54 v68 M108 51 v74 M103 49 v78" stroke="#d9c48c" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M44 131 h58" stroke="#d9c48c" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="24" y="34" width="86" height="92" rx="22" fill={`url(#${id('c')})`} fillOpacity=".95" />
        <rect x="27" y="37" width="80" height="86" rx="19" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
        <path d="M34 44 Q56 36 84 40 Q60 46 40 66 Z" fill={`url(#${id('g')})`} />
        {/* the spine crease: one soft band (a thin white line shimmered as he moved) */}
        <rect x="35" y="40" width="5" height="80" rx="2.5" fill="#16359a" fillOpacity=".22" />
        {mood === 'angry' && (
          <g>
            <rect className="jbd-flush" x="24" y="34" width="86" height="92" rx="22" fill="#ff4d5e" />
            {/* the anger mark (💢) and two puffs of steam */}
            <g className="jbd-vein" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M92 44 q4 4 0 8" /><path d="M100 44 q-4 4 0 8" /><path d="M92 54 q4 -4 8 0" /><path d="M92 42 q4 4 8 0" />
            </g>
            <g fill="#fff" opacity=".9">
              <g className="jbd-steam"><circle cx="40" cy="26" r="6" /><circle cx="46" cy="21" r="5" /><circle cx="35" cy="21" r="4" /></g>
              <g className="jbd-steam jbd-steam2"><circle cx="84" cy="22" r="5.5" /><circle cx="90" cy="17" r="4.5" /><circle cx="79" cy="18" r="3.5" /></g>
            </g>
          </g>
        )}
        {/* arms, in front so a wave or a cheer is seen */}
        <g className="jbd-armL"><path d="M28 94 L11 114" stroke="#2448b8" strokeWidth="8" strokeLinecap="round" /><circle cx="10" cy="115" r="6.5" fill="#4a72e8" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" /></g>
        <g className="jbd-armR"><path d="M106 94 L123 114" stroke="#2448b8" strokeWidth="8" strokeLinecap="round" /><circle cx="124" cy="115" r="6.5" fill="#4a72e8" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" /></g>

        {/* the face — soft and simple, like a sticker (owner: "see Cuppy") */}
        <ellipse cx="41" cy="98" rx="10" ry="6.5" fill={`url(#${id('k')})`} /><ellipse cx="93" cy="98" rx="10" ry="6.5" fill={`url(#${id('k')})`} />
        {happyFace ? (
          <g stroke="#0b2244" strokeWidth="4.5" strokeLinecap="round" fill="none">
            <path d="M44 88 Q52 78 60 88" /><path d="M74 88 Q82 78 90 88" />
          </g>
        ) : mood === 'angry' ? (
          <g>
            {/* V brows, squinted eyes */}
            <g stroke="#0b2244" strokeWidth="4.5" strokeLinecap="round"><path d="M42 74 L61 81" /><path d="M92 74 L73 81" /></g>
            <g className="jbd-eyes">
              <path d="M45 87 Q52 81 59 87 Q52 93 45 87 Z" fill="#0b2244" /><path d="M75 87 Q82 81 89 87 Q82 93 75 87 Z" fill="#0b2244" />
              <circle cx="50" cy="86" r="1.6" fill="#fff" /><circle cx="80" cy="86" r="1.6" fill="#fff" />
            </g>
          </g>
        ) : closedSmile ? (
          <g stroke="#0b2244" strokeWidth="4.5" strokeLinecap="round" fill="none">
            <path d="M44 88 Q52 80 60 88" /><path d="M74 88 Q82 80 90 88" />
          </g>
        ) : mood === 'sleepy' ? (
          <g stroke="#0b2244" strokeWidth="4" strokeLinecap="round" fill="none">
            {/* shut, drooping */}
            <path d="M44 86 Q52 93 60 86" /><path d="M74 86 Q82 93 90 86" />
          </g>
        ) : mood === 'reading' ? (
          <g className="jbd-eyes">
            {/* looking down at the page, running along the lines */}
            <ellipse cx="52" cy="88" rx="6.5" ry="7.5" fill="#0b2244" /><ellipse cx="82" cy="88" rx="6.5" ry="7.5" fill="#0b2244" />
            <circle cx="50" cy="90" r="2.4" fill="#fff" /><circle cx="80" cy="90" r="2.4" fill="#fff" />
            <path d="M44 81 Q52 77 60 81 M74 81 Q82 77 90 81" stroke="#2a52d1" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'thinking' ? (
          <g>
            {/* one brow up, eyes looking up and aside */}
            <path d="M74 73 Q82 66 90 72" stroke="#0b2244" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M45 77 Q52 75 59 77" stroke="#0b2244" strokeWidth="4" strokeLinecap="round" fill="none" />
            <g className="jbd-eyes">
              <ellipse cx="53" cy="86" rx="7" ry="8.5" fill="#0b2244" /><ellipse cx="83" cy="86" rx="7" ry="8.5" fill="#0b2244" />
              <circle cx="56" cy="81.5" r="2.8" fill="#fff" /><circle cx="86" cy="81.5" r="2.8" fill="#fff" />
            </g>
          </g>
        ) : mood === 'down' ? (
          <g>
            {/* worried brows, eyes looking down — no tears */}
            <g stroke="#0b2244" strokeWidth="4" strokeLinecap="round" fill="none"><path d="M44 79 L58 74" /><path d="M90 79 L76 74" /></g>
            <g className="jbd-eyes">
              <ellipse cx="52" cy="88" rx="6.5" ry="7.5" fill="#0b2244" /><ellipse cx="82" cy="88" rx="6.5" ry="7.5" fill="#0b2244" />
              <circle cx="50.5" cy="90.5" r="2.4" fill="#fff" /><circle cx="80.5" cy="90.5" r="2.4" fill="#fff" />
            </g>
          </g>
        ) : mood === 'sad' ? (
          <g>
            {/* > <  squeezed shut, big tears */}
            <g stroke="#0b2244" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M45 80 L56 86 L45 92" /><path d="M89 80 L78 86 L89 92" />
            </g>
            <path className="jbd-tear" d="M50 93 Q44 104 50 110 Q56 104 50 93 Z" fill="#7cc8ff" stroke="#fff" strokeWidth="1.5" />
            <path className="jbd-tear jbd-tear2" d="M84 93 Q78 104 84 110 Q90 104 84 93 Z" fill="#7cc8ff" stroke="#fff" strokeWidth="1.5" />
          </g>
        ) : (
          <g className="jbd-eyes">
            {/* glossy bead eyes */}
            <ellipse cx="52" cy="86" rx="7" ry="8.5" fill="#0b2244" /><ellipse cx="82" cy="86" rx="7" ry="8.5" fill="#0b2244" />
            <circle cx="49.5" cy="82.5" r="2.8" fill="#fff" /><circle cx="79.5" cy="82.5" r="2.8" fill="#fff" />
            <circle cx="54.5" cy="89.5" r="1.3" fill="#fff" opacity=".85" /><circle cx="84.5" cy="89.5" r="1.3" fill="#fff" opacity=".85" />
          </g>
        )}
        {/* the mouth */}
        {happyFace ? (
          <g><path d="M57 100 Q67 116 77 100 Z" fill="#7a1d3b" /><path d="M61 107 Q67 113 73 107 Q67 109 61 107 Z" fill="#ff8fa8" /></g>
        ) : mood === 'angry' ? (
          <path d="M59 108 Q63 101 67 105 Q71 101 75 108" stroke="#0b2244" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : closedSmile ? (
          <path d="M59 101 Q67 110 75 101" stroke="#0b2244" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        ) : mood === 'sleepy' ? (
          <ellipse className="jbd-snore" cx="67" cy="105" rx="3.6" ry="4.2" fill="#7a1d3b" />
        ) : mood === 'thinking' ? (
          <path d="M60 105 Q66 102 74 104" stroke="#0b2244" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        ) : mood === 'down' ? (
          <path d="M60 107 Q67 100 74 107" stroke="#0b2244" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        ) : mood === 'reading' ? (
          <path d="M62 102 Q67 106 72 102" stroke="#0b2244" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : mood === 'sad' ? (
          <path className="jbd-wobble" d="M61 106 Q64 101 67 104 Q70 101 73 106 Q67 112 61 106 Z" fill="#7a1d3b" />
        ) : (
          <g>
            <path className="jbd-smile" d="M61 101 Q67 107 73 101" stroke="#0b2244" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            {talking && <ellipse className="jbd-mouth" cx="67" cy="104" rx="5" ry="4.5" fill="#7a1d3b" />}
          </g>
        )}
        {mood === 'reading' && (
          <g>
            <path d="M40 113 Q67 108 94 113 L95 135 Q67 130 39 135 Z" fill="#e64a5c" />
            <path d="M43 112 Q55 108 67 113 V132 Q55 128 43 132 Z" fill="#fffaf0" stroke="#d9c48c" strokeWidth="1.2" />
            <path d="M91 112 Q79 108 67 113 V132 Q79 128 91 132 Z" fill="#fffaf0" stroke="#d9c48c" strokeWidth="1.2" />
            <path d="M47 117 h15 M47 121 h15 M47 125 h12 M72 117 h15 M72 121 h15 M75 125 h12" stroke="#9fb3e0" strokeWidth="1.6" strokeLinecap="round" />
            {/* a page turning */}
            <path className="jbd-page" d="M67 113 Q79 108 90 112 V131 Q79 127 67 132 Z" fill="#fff" stroke="#e7d9ad" strokeWidth="1" />
            <circle cx="40" cy="124" r="6.5" fill="#4a72e8" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />
            <circle cx="94" cy="124" r="6.5" fill="#4a72e8" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />
          </g>
        )}
        {cap && (
          <g>
            <path d="M48 38 Q67 46 86 38 V30 H48 Z" fill="#1f2f52" />
            <path d="M67 14 L106 27 L67 40 L28 27 Z" fill="#26375e" stroke="#0f1a33" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M40 26 L67 17 L94 26" stroke="#fff" strokeOpacity=".25" strokeWidth="2" fill="none" strokeLinecap="round" />
            <g className="jbd-tassel">
              <path d="M67 27 L100 31 L100 46" stroke="#f7c23e" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M97 45 h6 l-1 9 h-4 z" fill="#f7c23e" />
            </g>
            <circle cx="67" cy="27" r="3" fill="#f7c23e" />
          </g>
        )}
      </g>
    </svg>
  )
}
