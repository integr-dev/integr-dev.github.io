import type { Ref } from 'vue'
import { theme } from '~/themes/active'
import { deckRoot, isHydrated, requestHydration } from './hydration'
import type { useDeckNav } from './useDeckNav'

/**
 * Runs the theme's builder whenever a sheet (or stack slide) comes into view, and resets it
 * after it has left, so every visit draws it again. The deck layout uses the navigation
 * position; the narrow layout uses scroll visibility.
 */
/**
 * A CSS time value in ms. Handles both units: the production CSS minifier rewrites `700ms` as
 * `.7s`, and a plain parseFloat would read that as 0.7 ms.
 */
function cssTime(value: string) {
  const v = value.trim()
  const n = parseFloat(v)
  if (Number.isNaN(n)) return 0
  return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n
}

export function useBuild(nav: ReturnType<typeof useDeckNav>, narrow: Ref<boolean>) {
  const progress = useState('build-progress', () => 0)
  const building = ref(false)
  // the sheet whose code is still on its way, once that takes longer than LOADING_GRACE (the title
  // block turns its marker into a spinner)
  const waiting = useState<string | null>('sheet-waiting', () => null)
  const builder = theme.builder
  const controllers = new Map<HTMLElement, AbortController>()
  let active: HTMLElement | null = null
  let observer: IntersectionObserver | undefined
  let started = false
  // the first visit draws a little slower, later visits quicker
  const seen = new WeakSet<HTMLElement>()
  const FIRST_VISIT = 0.8
  const REVISIT = 1.5

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const transitionMs = () =>
    cssTime(getComputedStyle(document.documentElement).getPropertyValue('--transition-duration')) || 700

  const rootFor = deckRoot

  // ---------- lazy hydration (hydration.ts) ----------

  const idle = (fn: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300)

  /** The positions one step away: the sheets left and right, and the pages above and below. */
  function neighbours() {
    const roots: (HTMLElement | null)[] = []
    for (const i of [nav.x.value + 1, nav.x.value - 1]) {
      const s = nav.sheets[i]
      if (s) roots.push(rootFor(s.id, s.mode === 'stack' ? nav.slidesOf(s)[0]?.id ?? null : null))
    }
    const sheet = nav.sheet.value
    if (sheet.mode === 'stack') {
      const slides = nav.slidesOf(sheet)
      for (const j of [nav.y.value + 1, nav.y.value - 1]) {
        const slide = slides[j]
        if (slide) roots.push(rootFor(sheet.id, slide.id))
      }
    }
    return roots.filter((r): r is HTMLElement => !!r)
  }

  /**
   * Images in the sheets load lazily (every sheet is in the page, but only the one on screen needs
   * its pictures): a sheet about to be shown or drawn fetches its own now.
   */
  function loadImages(root: HTMLElement) {
    root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(img => (img.loading = 'eager'))
  }

  /** Once a sheet is live and the browser has nothing else to do, get its neighbours ready. */
  function prepareNeighbours() {
    idle(() => neighbours().forEach((r) => {
      requestHydration(r)
      loadImages(r)
    }))
  }

  /**
   * Resolves once the deck has stopped moving: every running slide transition on the track and
   * the vertical stacks has finished (or was cancelled by a newer move). Capped as a fallback.
   */
  async function motionSettled() {
    await nextTick()
    // let the new transform reach the style engine so its transition exists
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    const moving = [...document.querySelectorAll<HTMLElement>('.deck-track, .deck-stack')]
      .flatMap(el => el.getAnimations())
    if (!moving.length) return
    await Promise.race([
      Promise.allSettled(moving.map(a => a.finished)),
      new Promise(r => setTimeout(r, transitionMs() * 2 + 200)),
    ])
  }

  /** delay: ms to wait, or 'motion' to wait until the slide to this sheet has finished. */
  async function run(root: HTMLElement, delay: number | 'motion', track: boolean) {
    controllers.get(root)?.abort()
    const ctrl = new AbortController()
    controllers.set(root, ctrl)
    builder.reset(root)
    loadImages(root)
    if (track) progress.value = 0
    if (reduced()) {
      // nothing is drawn, so nothing to wait for: shown at once, made live alongside
      requestHydration(root)
      markDrawingStarted()
      builder.finish(root)
      if (track) progress.value = 1
      window.dispatchEvent(new CustomEvent('deck:built', { detail: root }))
      if (track) prepareNeighbours()
      return
    }
    if (delay === 'motion') await motionSettled()
    else await new Promise(r => setTimeout(r, delay))
    if (ctrl.signal.aborted) return
    // drawn only once live (usually it is: it was got ready as a neighbour)
    if (!isHydrated(root)) {
      const sheetId = nav.sheet.value.id
      const slow = track ? setTimeout(() => (waiting.value = sheetId), LOADING_GRACE) : undefined
      await requestHydration(root)
      clearTimeout(slow)
      if (waiting.value === sheetId) waiting.value = null
    }
    if (ctrl.signal.aborted) return
    // live: the sheets a click away can start loading while this one is drawn
    if (track) prepareNeighbours()
    markDrawingStarted()
    const speed = seen.has(root) ? REVISIT : FIRST_VISIT
    seen.add(root)
    if (track) building.value = true
    await builder.run(root, {
      signal: ctrl.signal,
      speed,
      onProgress: (p) => {
        if (track && root === active) progress.value = p
      },
    })
    if (track && root === active) building.value = false
    if (!ctrl.signal.aborted) window.dispatchEvent(new CustomEvent('deck:built', { detail: root }))
  }

  /** Finish the sheet being drawn right now, at once. */
  function skip() {
    const root = active
    if (!root || !building.value) return
    controllers.get(root)?.abort()
    builder.finish(root)
    building.value = false
    progress.value = 1
    window.dispatchEvent(new CustomEvent('deck:built', { detail: root }))
    prepareNeighbours()
  }

  function leave(root: HTMLElement, after: number) {
    controllers.get(root)?.abort()
    setTimeout(() => {
      if (root !== active) builder.reset(root)
    }, after)
  }

  function onPositionChange(delay: number | 'motion') {
    if (narrow.value || !started) return
    const sheet = nav.sheet.value
    const root = rootFor(sheet.id, sheet.mode === 'stack' ? nav.slideId.value : null)
    if (!root || root === active) return
    const previous = active
    active = root
    if (previous) leave(previous, transitionMs() + 50)
    run(root, delay, true)
  }

  // ---------- narrow layout: build what scrolls into view ----------

  let near: IntersectionObserver | undefined

  function observeAll() {
    observer?.disconnect()
    // sheets get ready a screen and a half before they scroll into view
    near?.disconnect()
    near = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          requestHydration(e.target)
          loadImages(e.target as HTMLElement)
          near!.unobserve(e.target)
        }
      }
    }, { rootMargin: '150% 0px' })
    document.querySelectorAll<HTMLElement>('[data-build-root]').forEach(el => near!.observe(el))
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const root = e.target as HTMLElement
        if (e.isIntersecting && !controllers.has(root)) run(root, 0, false)
        else if (!e.isIntersecting) {
          controllers.get(root)?.abort()
          controllers.delete(root)
          builder.reset(root)
        }
      }
    }, { threshold: 0.12 })
    document.querySelectorAll<HTMLElement>('[data-build-root]').forEach(el => observer!.observe(el))
  }

  function setMode() {
    if (!started) return
    for (const c of controllers.values()) c.abort()
    controllers.clear()
    active = null
    if (narrow.value) observeAll()
    else {
      observer?.disconnect()
      near?.disconnect()
      document.querySelectorAll<HTMLElement>('[data-build-root]').forEach(el => builder.reset(el))
      onPositionChange(0)
    }
  }

  // start drawing only once the slide to the new sheet has come to rest
  watch([nav.x, nav.slideId], () => onPositionChange('motion'))
  watch(narrow, () => nextTick(setMode))

  return {
    progress,
    building,
    waiting,
    skip,
    /** Call once after mount: the first sheet is drawn after the frame has been traced. */
    start(delay: number) {
      started = true
      // the sheet on screen is fetched and made live at once, while the frame is still traced
      const sheet = nav.sheet.value
      const first = rootFor(sheet.id, sheet.mode === 'stack' ? nav.slideId.value : null)
      if (first && !narrow.value) requestHydration(first)
      if (narrow.value) observeAll()
      else onPositionChange(delay)
    },
    /** The More slide is created on unlock, so the narrow observer has to pick it up. */
    refresh() {
      if (narrow.value) nextTick(observeAll)
    },
    stop() {
      observer?.disconnect()
      near?.disconnect()
      for (const c of controllers.values()) c.abort()
    },
  }
}
