import { theme } from '~/themes/active'

/**
 * The deck's draw-in for standalone pages (project pages, the 404 page). Every [data-build-root]
 * inside the page is drawn once when it scrolls into view; a click on the page or Space, Enter
 * or Esc finishes whatever is being drawn. Unlike the deck, nothing is reset on leaving: these
 * pages are read top to bottom.
 */
export function usePageBuild(delay = 300) {
  const builder = theme.builder
  // one pen for the whole page, so sections are drawn one after another in the order they appear
  const queue: HTMLElement[] = []
  let current: { root: HTMLElement, ctrl: AbortController } | null = null
  let observer: IntersectionObserver | undefined

  async function next() {
    if (current || !queue.length) return
    const root = queue.shift()!
    const ctrl = new AbortController()
    current = { root, ctrl }
    await builder.run(root, { signal: ctrl.signal, speed: 1, onProgress: () => {} })
    if (!ctrl.signal.aborted) window.dispatchEvent(new CustomEvent('deck:built', { detail: root }))
    if (current?.ctrl === ctrl) current = null
    next()
  }

  function skip() {
    if (!current) return
    current.ctrl.abort()
    for (const root of [current.root, ...queue.splice(0)]) {
      builder.finish(root)
      window.dispatchEvent(new CustomEvent('deck:built', { detail: root }))
    }
    current = null
  }

  function onPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('a, button')) return
    skip()
  }

  function onKey(e: KeyboardEvent) {
    if (current && [' ', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault()
      skip()
    }
  }

  onMounted(() => {
    const roots = [...document.querySelectorAll<HTMLElement>('[data-build-root]')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      roots.forEach(r => builder.finish(r))
      return
    }
    // hide everything first so nothing below the fold flashes in finished before its turn
    roots.forEach(r => builder.reset(r))
    observer = new IntersectionObserver((entries) => {
      const seen = entries.filter(e => e.isIntersecting).map(e => e.target as HTMLElement)
      seen.forEach(r => observer!.unobserve(r))
      queue.push(...seen.sort((a, b) => roots.indexOf(a) - roots.indexOf(b)))
      next()
    }, { threshold: 0.12 })
    // after a short pause, so the page has painted before the pen starts
    setTimeout(() => roots.forEach(r => observer!.observe(r)), delay)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    current?.ctrl.abort()
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('keydown', onKey)
  })
}
