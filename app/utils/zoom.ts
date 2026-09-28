/**
 * The zoom on <html> (set in nuxt.config: the window's size relative to the reference window; 1 on phones).
 * Rects and pointer positions come in screen pixels; anything placed with CSS inside the page uses
 * page pixels, so divide by this.
 */
export function pageZoom() {
  if (typeof document === 'undefined') return 1
  return Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1
}

/** A rect from getBoundingClientRect in page pixels. */
export function unzoomRect(r: DOMRect) {
  const z = pageZoom()
  return z === 1 ? r : new DOMRect(r.x / z, r.y / z, r.width / z, r.height / z)
}
