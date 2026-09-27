import type { Ref } from 'vue'
import { theme } from '~/themes/active'
import type { useDeckNav } from './useDeckNav'

/**
 * Runs the theme's builder whenever a sheet (or stack slide) comes into view, and resets it
 * after it has left, so every visit draws it again. The deck layout uses the navigation
 * position; the narrow layout uses scroll visibility.
 */
export function useBuild(nav: ReturnType<typeof useDeckNav>, narrow: Ref<boolean>) {
  const progress = useState('build-progress', () => 0)
  const building = ref(false)
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
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-duration')) || 700

  function rootFor(sheetId: string, slideId: string | null) {
    if (slideId) return document.getElementById(`slide-${sheetId}-${slideId}`)
    return document.getElementById(`sheet-${sheetId}`)?.querySelector<HTMLElement>('[data-build-root]') ?? null
  }

  async function run(root: HTMLElement, delay: number, track: boolean) {
    controllers.get(root)?.abort()
    const ctrl = new AbortController()
    controllers.set(root, ctrl)
    builder.reset(root)
    if (track) progress.value = 0
    if (reduced()) {
      builder.finish(root)
      if (track) progress.value = 1
      window.dispatchEvent(new CustomEvent('deck:built', { detail: root }))
      return
    }
    await new Promise(r => setTimeout(r, delay))
    if (ctrl.signal.aborted) return
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
  }

  function leave(root: HTMLElement, after: number) {
    controllers.get(root)?.abort()
    setTimeout(() => {
      if (root !== active) builder.reset(root)
    }, after)
  }

  function onPositionChange(delay: number) {
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

  function observeAll() {
    observer?.disconnect()
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
      document.querySelectorAll<HTMLElement>('[data-build-root]').forEach(el => builder.reset(el))
      onPositionChange(0)
    }
  }

  watch([nav.x, nav.slideId], () => onPositionChange(transitionMs()))
  watch(narrow, () => nextTick(setMode))

  return {
    progress,
    building,
    skip,
    /** Call once after mount: the first sheet is drawn after the frame has been traced. */
    start(delay: number) {
      started = true
      if (narrow.value) observeAll()
      else onPositionChange(delay)
    },
    /** The More slide is created on unlock, so the narrow observer has to pick it up. */
    refresh() {
      if (narrow.value) nextTick(observeAll)
    },
    stop() {
      observer?.disconnect()
      for (const c of controllers.values()) c.abort()
    },
  }
}
