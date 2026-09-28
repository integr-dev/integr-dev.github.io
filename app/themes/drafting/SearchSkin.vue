<script setup lang="ts">
import type { SearchEntry } from '~/deck/types'
import { builder } from './builder'

const props = defineProps<{
  open: boolean
  query: string
  results: SearchEntry[]
  activeIndex: number
}>()

const emit = defineEmits<{
  'select': [entry: SearchEntry]
  'close': []
  'update:query': [value: string]
  'move': [delta: number]
}>()

// The panel is drawn like a sheet when it opens and taken apart again when it closes.
const shown = ref(false)
const panel = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
let ctrl: AbortController | undefined

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

watch(() => props.open, async (open) => {
  ctrl?.abort()
  ctrl = new AbortController()
  const signal = ctrl.signal
  if (open) {
    shown.value = true
    await nextTick()
    input.value?.focus()
    if (!panel.value) return
    builder.reset(panel.value)
    if (reduced()) builder.finish(panel.value)
    else builder.run(panel.value, { signal, onProgress: () => {}, speed: 2.5 })
  }
  else {
    if (panel.value && !reduced()) await builder.unbuild(panel.value, { signal })
    if (!signal.aborted) shown.value = false
  }
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); emit('move', 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); emit('move', -1) }
  else if (e.key === 'Enter') {
    const hit = props.results[props.activeIndex]
    if (hit) emit('select', hit)
  }
  else if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div v-if="shown" class="search-scrim" :class="{ 'is-closing': !open }" @mousedown.self="emit('close')">
    <div id="search-panel" ref="panel" class="search" role="dialog" :aria-label="$t('search.label')" data-build-root data-nopen>
      <!-- outline first -->
      <span class="edge edge-t" data-build="line" />
      <span class="edge edge-r" data-build="vline" />
      <span class="edge edge-b" data-build="line" />
      <span class="edge edge-l" data-build="vline" />

      <header class="s-head mono">
        <span data-build="type">{{ $t('search.title') }}</span>
        <span class="muted" data-build="type">/ ⌘K ⌥Space</span>
      </header>

      <label class="s-field">
        <FontAwesomeIcon icon="magnifying-glass" class="s-icon" />
        <input
          ref="input"
          :value="query"
          type="text"
          :placeholder="$t('search.placeholder')"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          :aria-activedescendant="results.length ? `search-hit-${activeIndex}` : undefined"
          @input="emit('update:query', ($event.target as HTMLInputElement).value)"
          @keydown="onKey"
        >
      </label>
      <span class="rule" data-build="line" />

      <ul v-if="results.length" id="search-results" class="s-results" role="listbox">
        <li
          v-for="(r, i) in results"
          :id="`search-hit-${i}`"
          :key="`${r.kind}-${r.label}-${i}`"
          role="option"
          :aria-selected="i === activeIndex"
          :class="{ 'is-active': i === activeIndex }"
          @mousedown.prevent="emit('select', r)"
        >
          <span class="r-mark" aria-hidden="true">›</span>
          <span class="r-label">{{ r.label }}</span>
          <span class="r-kind mono">{{ $t(`search.kind.${r.kind}`) }}</span>
          <span class="r-text">{{ r.text }}</span>
        </li>
      </ul>
      <p v-else-if="query" class="s-empty muted">{{ $t('search.empty', { query }) }}</p>

      <p class="s-hints mono" data-build="fade" data-nopen>
        <span><kbd>↑</kbd><kbd>↓</kbd> {{ $t('search.choose') }}</span>
        <span><kbd>⏎</kbd> {{ $t('search.open') }}</span>
        <span><kbd>esc</kbd> {{ $t('search.close') }}</span>
      </p>

    </div>
  </div>
</template>

<style scoped>
.search-scrim {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 60%, transparent);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: calc(var(--vh) * 15);
  animation: scrim-in 200ms ease both;
}

.search-scrim.is-closing {
  animation: scrim-out 380ms ease both;
}

@keyframes scrim-in {
  from { background: transparent; }
}

@keyframes scrim-out {
  to { background: transparent; }
}

/* the panel is plain paper, its outline is drawn by the four edges */
.search {
  position: relative;
  width: min(640px, calc(calc(var(--vw) * 100) - 32px));
  background: var(--bg);
  padding: 14px 18px 10px;
}

.edge {
  position: absolute;
  background: var(--line-strong);
}

.edge-t,
.edge-b {
  left: 0;
  right: 0;
  height: 1px;
}

.edge-l,
.edge-r {
  top: 0;
  bottom: 0;
  width: 1px;
}

.edge-t { top: 0; }
.edge-b { bottom: 0; transform-origin: right center; }
.edge-l { left: 0; transform-origin: bottom; }
.edge-r { right: 0; transform-origin: top; }

.s-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--line);
}

.s-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0 10px;
}

.s-icon {
  color: var(--accent);
}

input {
  flex: 1;
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--fg);
  background: none;
  border: 0;
  outline: none;
}

input::placeholder {
  color: var(--fg-muted);
}

.rule {
  margin-bottom: 6px;
}

.s-results {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: calc(var(--vh) * 46);
  overflow-y: auto;
}

.s-results li {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  gap: 0 8px;
  padding: 8px 4px;
  border-bottom: 1px dashed var(--bg-grid-strong);
  cursor: pointer;
}

.r-mark {
  color: transparent;
}

.s-results li.is-active {
  background: var(--accent-wash);
}

.s-results li.is-active .r-mark {
  color: var(--accent);
}

.r-label {
  color: var(--fg);
  font-weight: 500;
}

.r-kind {
  font-size: 0.7rem;
  color: var(--line);
  align-self: center;
}

.r-text {
  grid-column: 2 / -1;
  font-size: 0.85rem;
  color: var(--fg-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s-empty {
  margin: 0;
  padding: 12px 0;
}

.s-hints {
  display: flex;
  gap: 18px;
  margin: 10px 0 0;
  font-size: 0.7rem;
  color: var(--fg-muted);
}

kbd {
  font: inherit;
  border: 1px solid var(--line-strong);
  padding: 0 4px;
  margin-right: 3px;
}
</style>
