import { defineAsyncComponent, defineComponent, getCurrentInstance, h, onMounted } from 'vue'
import type { Component, HydrationStrategy } from 'vue'

/**
 * Lazy hydration for the deck's sheets. Every sheet is in the prerendered page, but its code is only
 * loaded and made live when it is needed: the sheet on screen at once, the ones a click away once
 * that sheet has been drawn and the browser is idle (useBuild). Until then a sheet is plain static
 * HTML, visible to readers and search engines. The builder draws a sheet only once it is live,
 * because drawing splits text into letters, which a later hydration would trip over.
 *
 * Keyed by the sheet's build root, the [data-build-root] element Deck.vue renders around it.
 */

interface Entry {
  hydrate?: () => void
  requested: boolean
  hydrated: boolean
  done: Promise<void>
  resolve: () => void
}

const entries = new Map<Element, Entry>()

function entry(root: Element): Entry {
  let e = entries.get(root)
  if (!e) {
    let resolve!: () => void
    const done = new Promise<void>(r => (resolve = r))
    e = { requested: false, hydrated: false, done, resolve }
    entries.set(root, e)
  }
  return e
}

const rootOf = (el: Node) => (el instanceof Element ? el : el.parentElement)?.closest('[data-build-root]') ?? null

/** Load and hydrate the sheet in this build root (if it is not already); resolves once it is live. */
export function requestHydration(root: Element): Promise<void> {
  const e = entry(root)
  if (!e.requested) {
    e.requested = true
    e.hydrate?.()
  }
  return e.done
}

export function isHydrated(root: Element) {
  return entries.get(root)?.hydrated ?? false
}

/** The build root of a deck position (a stack's slide, or the sheet itself). */
export function deckRoot(sheetId: string, slideId?: string | null): HTMLElement | null {
  if (slideId) return document.getElementById(`slide-${sheetId}-${slideId}`)
  return document.getElementById(`sheet-${sheetId}`)?.querySelector<HTMLElement>('[data-build-root]') ?? null
}

// Vue calls this when it reaches a lazy sheet during hydration. The sheet waits until someone
// asks for it (requestHydration); asked for already, it goes at once.
const onRequest: HydrationStrategy = (hydrate, forEachElement) => {
  let root: Element | null = null
  forEachElement((el) => {
    root ??= rootOf(el)
  })
  if (!root) {
    hydrate()
    return
  }
  const e = entry(root)
  e.hydrate = hydrate
  if (e.requested) hydrate()
  return () => {
    if (entries.get(root!) === e && !e.hydrated) e.hydrate = undefined
  }
}

/**
 * A sheet component that hydrates on request. Its mounted hook marks its build root live, both
 * after a lazy hydration and when it is created in the browser (the More slide).
 */
export function lazySheet(loader: () => Promise<{ default: Component }>) {
  return defineAsyncComponent({
    // a thin wrapper (no element of its own, so the markup still matches) that notices the mount
    loader: () => loader().then(m => defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        const self = getCurrentInstance()
        onMounted(() => {
          const root = self?.proxy?.$el ? rootOf(self.proxy.$el as Node) : null
          if (!root) return
          const e = entry(root)
          e.requested = e.hydrated = true
          e.resolve()
        })
        return () => h(m.default, attrs, slots)
      },
    })),
    hydrate: onRequest,
  })
}
