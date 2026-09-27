import type { RouterConfig } from '@nuxt/schema'

// Moving through the deck changes the path; the page itself never scrolls to the top for it.
export default <RouterConfig>{
  scrollBehavior: (_to, _from, saved) => saved ?? false,
}
