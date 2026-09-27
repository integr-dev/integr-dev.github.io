<script setup lang="ts">
const props = defineProps<{
  x: number
  total: number
  y: number
  yTotal: number
  titles: string[]
  visited: string[]
  ids: string[]
  handle: string
  /** 0..1 while the current sheet is drawn */
  progress: number
}>()

const emit = defineEmits<{
  go: [index: number]
  prev: []
  next: []
  up: []
  down: []
  search: []
}>()

const current = computed(() => props.titles[props.x] ?? '')

// Expanded while hovered or keyboard-focused. A click on a marker collapses it until the pointer
// leaves or moves on. Changes are announced on window so the butterfly can react.
const hovered = ref(false)
const focused = ref(false)
const suppressed = ref(false)
const expanded = computed(() => (hovered.value || focused.value) && !suppressed.value)

watch(expanded, (open) => {
  window.dispatchEvent(new CustomEvent(open ? 'titleblock:expand' : 'titleblock:collapse'))
})

function leave() {
  hovered.value = false
  suppressed.value = false
}

function onFocusIn(e: FocusEvent) {
  focused.value = (e.target as HTMLElement).matches(':focus-visible')
}

// where the marker was clicked: moving away from it opens the block again
let clickAt: { x: number, y: number } | null = null

function onMove(e: MouseEvent) {
  if (!suppressed.value || !clickAt) return
  if (Math.hypot(e.clientX - clickAt.x, e.clientY - clickAt.y) > 8) {
    suppressed.value = false
    clickAt = null
  }
}

function pick(i: number, e: MouseEvent) {
  emit('go', i)
  clickAt = { x: e.clientX, y: e.clientY }
  suppressed.value = true
  focused.value = false
  ;(e.currentTarget as HTMLElement).blur()
}
</script>

<template>
  <nav
    class="title-block mono"
    :class="{ 'is-expanded': expanded }"
    aria-label="Sheets"
    @mouseenter="hovered = true"
    @mouseleave="leave"
    @mousemove="onMove"
    @focusin="onFocusIn"
    @focusout="focused = false"
  >
    <span id="butterfly-perch" class="perch" aria-hidden="true" />

    <div class="tb-head">
      <img class="tb-logo" src="/img/logo-72.png" alt="" width="36" height="36">
      <div class="tb-names">
        <span class="tb-handle">{{ handle }}</span>
        <span class="tb-current" aria-live="polite">{{ current }}</span>
      </div>
      <span class="tb-status" :class="{ 'is-done': progress >= 1 }">{{ progress >= 1 ? 'Done' : `${Math.round(progress * 100)}%` }}</span>
      <div class="tb-y" :class="{ 'is-empty': yTotal < 2 }">
        <button type="button" :disabled="y === 0" aria-label="Up" @click="emit('up')">
          <FontAwesomeIcon icon="arrow-up" />
        </button>
        <button type="button" :disabled="y >= yTotal - 1" aria-label="Down" @click="emit('down')">
          <FontAwesomeIcon icon="arrow-down" />
        </button>
      </div>
    </div>
    <span class="tb-progress" :style="{ transform: `scaleX(${progress})` }" />
    <ol class="tb-ticks">
      <li v-for="(t, i) in titles" :key="ids[i]">
        <button
          type="button"
          class="tick"
          :class="{ 'is-current': i === x, 'is-visited': visited.includes(ids[i]!) }"
          :aria-label="t"
          :aria-current="i === x ? 'page' : undefined"
          @click="pick(i, $event)"
        >
          <span class="tick-label">{{ t }}</span>
        </button>
      </li>
    </ol>
    <div class="tb-foot">
      <button type="button" class="tb-search" @click="emit('search')">
        <kbd>/</kbd> search
      </button>
      <span class="tb-arrows">
        <button type="button" :disabled="x === 0" aria-label="Previous sheet" @click="emit('prev')">
          <FontAwesomeIcon icon="arrow-left" />
        </button>
        <button type="button" :disabled="x >= total - 1" aria-label="Next sheet" @click="emit('next')">
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </span>
    </div>
  </nav>
</template>

<style scoped>
.title-block {
  position: fixed;
  right: var(--frame-gap);
  bottom: var(--frame-gap);
  z-index: 30;
  width: 272px;
  background: var(--bg);
  border-left: 1px solid var(--line-strong);
  border-top: 1px solid var(--line-strong);
  font-size: 0.72rem;
  color: var(--fg-muted);
}

html.js .title-block {
  animation: tb-in 420ms ease 900ms both;
}

@keyframes tb-in {
  from { opacity: 0; }
}

.perch {
  position: absolute;
  top: -2px;
  right: 18px;
  width: 1px;
  height: 1px;
}

/* on hover or focus the marker row grows and every marker shows its sheet name */
.title-block {
  transition: width 260ms var(--transition-ease);
}

.title-block.is-expanded {
  width: 340px;
}

.tick {
  position: relative;
  overflow: hidden;
  transition: height 260ms var(--transition-ease);
}

.tick::before {
  transition:
    inset 260ms var(--transition-ease),
    background-color 160ms ease,
    border-color 160ms ease;
}

.tick-label {
  position: absolute;
  left: 50%;
  bottom: 6px;
  translate: -50% 0;
  writing-mode: vertical-rl;
  rotate: 180deg;
  white-space: nowrap;
  font-size: 0.7rem;
  line-height: 1;
  color: var(--fg-muted);
  opacity: 0;
  transition: opacity 160ms ease;
}

.title-block.is-expanded .tb-ticks {
  gap: 4px;
}

.title-block.is-expanded .tick {
  height: 92px;
}

.title-block.is-expanded .tick::before {
  inset: 0 1px;
}

.title-block.is-expanded .tick-label {
  opacity: 1;
  transition-delay: 120ms;
}

.tick.is-visited .tick-label {
  color: var(--fg);
}

.tick.is-current .tick-label {
  color: var(--accent-contrast);
  font-weight: 700;
}

.tb-head {
  display: grid;
  /* no gap before the up/down arrows: their own margin collapses with them (see .tb-y) */
  grid-template-columns: auto 1fr auto auto;
  column-gap: 0;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid var(--line-strong);
}

.tb-logo {
  width: 36px;
  height: 36px;
  image-rendering: pixelated;
}

.tb-names {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
  min-width: 0;
}

.tb-handle {
  color: var(--fg-muted);
}

.tb-current {
  color: var(--fg);
  font-weight: 700;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tb-status {
  font-size: 0.7rem;
  color: var(--accent);
  min-width: 4ch;
  text-align: right;
}

.tb-status.is-done {
  color: var(--line);
}

.tb-progress {
  display: block;
  height: 2px;
  margin-top: -1px;
  background: var(--accent);
  transform-origin: left;
  transition: transform 120ms linear;
}

.tb-names {
  margin-left: 10px;
}

.tb-status {
  margin-left: 10px;
}

/* the up/down arrows fold away when there is no page above or below; the % slides to the edge */
.tb-y {
  display: flex;
  flex-direction: column;
  max-width: 40px;
  margin-left: 10px;
  overflow: hidden;
  transition:
    max-width 260ms var(--transition-ease),
    margin-left 260ms var(--transition-ease),
    opacity 200ms ease;
}

.tb-y.is-empty {
  max-width: 0;
  margin-left: 0;
  opacity: 0;
  pointer-events: none;
}

.tb-ticks {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 2px 4px;
  border-bottom: 1px solid var(--line-strong);
}

/* the button is a 24px hit area; the visible marker is the small box drawn inside it */
.tick {
  display: block;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  border-radius: 0;
}

.tick::before {
  content: '';
  position: absolute;
  inset: 7px 5px;
  border: 1px solid var(--line);
}

.tick.is-visited::before {
  background: color-mix(in srgb, var(--line) 35%, transparent);
}

.tick.is-current::before {
  background: var(--accent);
  border-color: var(--accent);
}

.tick:hover::before {
  border-color: var(--fg);
}

.tb-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px 4px 10px;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 4px 6px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  color: var(--fg);
}

button:disabled {
  opacity: 0.3;
  cursor: default;
}

.tb-search {
  padding-left: 0;
}

kbd {
  font: inherit;
  color: var(--accent);
  border: 1px solid var(--line-strong);
  padding: 0 4px;
  margin-right: 4px;
}

@media (max-width: 767px) {
  .title-block {
    display: none;
  }
}
</style>
