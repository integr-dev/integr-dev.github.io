/**
 * The moment the first sheet (or page) starts to be drawn. The decoration (bushes, title block,
 * arrows, butterfly) starts with it rather than with the page load, so on a slow connection it
 * does not grow long before the content, which waits for its code. Marked on <html> as
 * .is-drawing; CSS keeps the decoration back until then.
 */
export function markDrawingStarted() {
  const root = document.documentElement
  if (root.classList.contains('is-drawing')) return
  root.classList.add('is-drawing')
  window.dispatchEvent(new Event('deck:drawing'))
}

/** Runs fn once drawing has started (at once if it already has). */
export function onDrawingStarted(fn: () => void) {
  if (document.documentElement.classList.contains('is-drawing')) return fn()
  window.addEventListener('deck:drawing', fn, { once: true })
}

/** Grace before a loading indicator shows: what is done sooner never shows one. */
export const LOADING_GRACE = 300
