<script setup lang="ts">
import Deck from '~/deck/Deck.vue'
import { useDeckNav } from '~/deck/useDeckNav'
import type { SlideDef } from '~/deck/types'

// Every URL of the site is a position in the one deck: /, /projects/osmium, /posts/<slug>, ...
// The same page instance stays mounted while the path changes, so moving around is a slide, not
// a page load; search engines still get a prerendered page per path with its own title.
// Also across languages: a language switch swaps the texts in place (see useSiteContent).
definePageMeta({ key: 'deck' })

const route = useRoute()
const nav = useDeckNav()
const { t, locale } = useI18n()
const content = await useSiteContent()

// one page below the post list per post (sheets.config: slidesFrom 'posts')
useState<SlideDef[]>('deck-post-slides').value = content.posts.value.map(p => ({
  id: p.path.split('/').pop()!,
  component: 'PostSlide',
  props: { path: p.path },
}))

if (!nav.applyPath(route.path)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useDeckSeo(content, nav)
useHead({
  htmlAttrs: { lang: () => (locale.value === 'de' ? 'de-AT' : 'en') },
  // the feed itself is English; its name follows the page language
  link: () => [{ rel: 'alternate', type: 'application/rss+xml', title: `${content.profile.value?.fullName} · ${t('sheets.posts')}`, href: '/feed.xml' }],
})
</script>

<template>
  <Deck />
</template>
