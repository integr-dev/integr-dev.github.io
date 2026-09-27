<script setup lang="ts">
import { theme } from '~/themes/active'
import type { SearchEntry } from './types'
import { searchEntries, useSearchIndex } from './useSearch'
import { useDeckNav } from './useDeckNav'

const open = useState('search-open', () => false)
const highlight = useState<{ anchor: string, nonce: number } | null>('deck-highlight', () => null)
const query = ref('')
const active = ref(0)

const nav = useDeckNav()
const index = await useSearchIndex()
const results = computed(() => searchEntries(index.value, query.value))

watch(query, () => (active.value = 0))
watch(open, (o) => {
  if (!o) query.value = ''
})

function move(delta: number) {
  const n = results.value.length
  if (n) active.value = (active.value + delta + n) % n
}

const isNarrow = () => window.matchMedia('(max-width: 767px)').matches

async function select(entry: SearchEntry) {
  open.value = false
  if (entry.to) {
    await navigateTo(entry.to)
    return
  }
  const moved = nav.goTo(entry.sheetId, entry.slideId)
  // the target sheet is drawn when it arrives, so wait for that before pointing at something on it
  if (moved) await builtOnce(4500)
  const anchor = entry.anchor ?? `sheet-${entry.sheetId}`
  const el = document.getElementById(anchor)
  if (!el) return
  // In the deck, scrollIntoView would scroll the clipped track, so it is only used in the narrow layout.
  if (isNarrow()) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.remove('is-search-hit')
  void el.offsetWidth
  el.classList.add('is-search-hit')
  setTimeout(() => el.classList.remove('is-search-hit'), 3600)
  highlight.value = { anchor, nonce: Date.now() }
}

function builtOnce(timeout: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      window.removeEventListener('deck:built', done)
      resolve()
    }
    window.addEventListener('deck:built', done)
    setTimeout(done, timeout)
  })
}
</script>

<template>
  <component
    :is="theme.SearchSkin"
    :open="open"
    :query="query"
    :results="results"
    :active-index="active"
    @update:query="query = $event"
    @move="move"
    @select="select"
    @close="open = false"
  />
</template>
