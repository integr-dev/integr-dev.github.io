declare global {
  interface Window {
    /** Screen pixels at the window's left taken by the Nuxt Studio panel (plugins/studio-stage.client.ts). */
    __stageLeft?: number
  }
}

/**
 * The zoom on <html> (set in nuxt.config: the window's size relative to the reference window; 1 on phones).
 * Rects and pointer positions come in screen pixels; anything placed with CSS inside the page uses
 * page pixels, so divide by this.
 */
export function pageZoom() {
  if (typeof document === 'undefined') return 1
  return Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1
}

/** Where the page starts on screen, in screen pixels: right of the Studio panel while it is open, else 0. */
export function stageLeft() {
  if (typeof window === 'undefined') return 0
  return window.__stageLeft ?? 0
}

/** The width of the window the page is laid out in (the window minus the Studio panel), in screen pixels. */
export function stageWidth() {
  return window.innerWidth - stageLeft()
}

/** A rect from getBoundingClientRect in page pixels. */
export function unzoomRect(r: DOMRect) {
  const z = pageZoom()
  const s = stageLeft()
  return z === 1 && !s ? r : new DOMRect((r.x - s) / z, r.y / z, r.width / z, r.height / z)
}
