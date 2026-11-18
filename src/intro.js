// The opening (dust gathering into the headline) plays on every page load; Esc skips it.
// ?intro=0 turns it off, e.g. for screenshots.
export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('intro') !== '0'
}

