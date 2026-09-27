import type { RouterConfig } from '@nuxt/schema'

// The deck uses the hash for its position, so hash changes must never scroll the window.
export default <RouterConfig>{
  scrollBehavior(to, from, saved) {
    if (to.path === from.path) return false
    return saved ?? { top: 0 }
  },
}
