/** An event from the Nuxt Studio editor panel: the page's keys, wheel and taps leave it alone. */
export function fromStudio(e: Event) {
  return e.composedPath().some(n => (n as Element).tagName === 'NUXT-STUDIO')
}
