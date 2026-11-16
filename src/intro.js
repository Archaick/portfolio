// The opening fall plays on every page load (Esc skips it).
// ?intro=0 turns it off, e.g. for screenshots.
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('intro') !== '0'
}

// With "reduce motion" on (e.g. Windows animation effects off) a gentler fall
// plays: the same descent and warming sky, slower, with no streaks.
export function gentleIntro() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
