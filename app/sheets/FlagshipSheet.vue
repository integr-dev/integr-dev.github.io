<script setup lang="ts">
import OsmiumDiagram from './diagrams/OsmiumDiagram.vue'
import ClayDiagram from './diagrams/ClayDiagram.vue'
import ForkcastDiagram from './diagrams/ForkcastDiagram.vue'
import BarChart from './diagrams/BarChart.vue'
import type { Component } from 'vue'
import { theme } from '~/themes/active'
import { useLightbox } from '~/composables/useLightbox'

const lightbox = useLightbox()
const { t, te, locale } = useI18n()
// labels that come from the content (stat names, visual names), translated where a message exists
const label = (group: string, key: string) => (te(`${group}.${key}`) ? t(`${group}.${key}`) : key)

const props = withDefaults(defineProps<{ project: string, visual?: 'left' | 'right', sheetId?: string }>(), { visual: 'left' })
const { project: find } = await useSiteContent()
const p = computed(() => find(props.project))

const diagrams: Record<string, Component> = { osmium: OsmiumDiagram, clay: ClayDiagram, forkcast: ForkcastDiagram }
const visuals = computed(() => p.value?.visuals ?? [])

// Several visuals form a carousel. Pages share one spot: the current one fades out, and after a
// short pause the next one is drawn in its place.
const active = ref(0)
const leaving = ref<number | null>(null)
const panes = ref<HTMLElement[]>([])
const count = computed(() => visuals.value.length)
let ctrl: AbortController | undefined
let fadeTimer: ReturnType<typeof setTimeout> | undefined

function show(i: number) {
  const n = count.value
  const next = (i + n) % n
  if (next === active.value) return
  const prev = active.value
  const pane = panes.value[next]
  const old = panes.value[prev]
  if (!pane) return
  ctrl?.abort()
  ctrl = new AbortController()
  const signal = ctrl.signal
  clearTimeout(fadeTimer)
  theme.builder.reset(pane)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    active.value = next
    theme.builder.finish(pane)
    if (old) theme.builder.reset(old)
    return
  }
  leaving.value = prev
  active.value = next
  fadeTimer = setTimeout(() => {
    leaving.value = null
    if (old && old !== panes.value[active.value]) theme.builder.reset(old)
  }, 320)
  setTimeout(() => {
    if (!signal.aborted) theme.builder.run(pane, { signal, onProgress: () => {} })
  }, 220)
}

/**
 * Where screenshot i of n sits in the stack, in % of the stack box. Up to three zig-zag down
 * like Forkcast's; more go into two columns, row by row, so each one stays mostly visible.
 * The first is on top.
 */
function stackStyle(i: number, n: number) {
  const side = i % 2 ? 'right' : 'left'
  if (n <= 3) {
    const h = 55
    const top = n > 1 ? (i / (n - 1)) * (100 - h) : 0
    return { top: `${top}%`, [side]: `${Math.floor(i / 2) * 10}%`, maxWidth: '74%', maxHeight: `${h}%`, zIndex: n - i }
  }
  const rows = Math.ceil(n / 2)
  const row = Math.floor(i / 2)
  const h = Math.min(55, 125 / rows)
  const top = rows > 1 ? (row / (rows - 1)) * (100 - h) : 0
  return { top: `${top}%`, [side]: `${row * 3}%`, maxWidth: '56%', maxHeight: `${h}%`, zIndex: n - i }
}

const asOf = computed(() => {
  const d = p.value?.stats?.asOf
  return d ? formatDate(d, false, locale.value) : ''
})
</script>

<template>
  <article v-if="p" class="sheet flagship" :class="[`visual-${visual}`, `project-${project}`]">
    <!-- title and text always stay together in one column -->
    <div class="f-main">
      <h2 :id="`project-${project}`" data-build="type">{{ p.title }}</h2>
      <p class="f-tagline" data-build="print">{{ p.tagline }}</p>
      <span class="rule" data-build="line" />
      <p v-if="p.why" class="f-why" data-build="print">
        <strong>{{ t('flagship.why') }}</strong> {{ p.why }}
      </p>
      <div v-if="!visuals.some(v => v.kind === 'code')" class="f-body" data-build="print">
        <ContentRenderer :value="p" />
      </div>
      <p v-if="p.stats" class="f-stats mono" data-build="chips">
        <template v-for="(s, i) in p.stats.items" :key="s.label">
          <span v-if="i" class="sep" aria-hidden="true">/</span>
          <span><b data-build="count">{{ s.value }}</b> {{ label('stats', s.label) }}</span>
        </template>
        <a class="f-source" :href="p.stats.source" target="_blank" rel="noopener">{{ t('flagship.asOf', { date: asOf }) }}</a>
      </p>
      <ul class="f-stack" data-build="chips">
        <li v-for="s in p.stack" :key="s" class="chip">{{ s }}</li>
      </ul>
      <p class="f-links" data-build="chips">
        <a v-for="l in p.links" :key="l.href" :href="l.href" target="_blank" rel="noopener">
          {{ label('link', l.label) }} <FontAwesomeIcon icon="arrow-up-right-from-square" class="ext" />
        </a>
      </p>
    </div>

    <div class="f-visual">
      <a v-if="p.badge && !visuals.some(v => v.kind === 'chart')" class="f-badge" :href="p.badge.href" target="_blank" rel="noopener">
        <span class="badge-value" data-build="count">{{ p.badge.value }}</span>
        <span class="badge-dim" data-build="line" />
        <span class="badge-label mono" data-build="type">{{ p.badge.label }}, {{ asOf }}</span>
      </a>

      <div class="f-carousel" :aria-roledescription="count > 1 ? 'carousel' : undefined">
        <div class="f-track">
          <div
            v-for="(v, i) in visuals"
            :key="i"
            :ref="el => { if (el) panes[i] = el as HTMLElement }"
            class="f-pane"
            :class="[`pane-${v.kind}`, { 'is-active': i === active, 'is-leaving': i === leaving }]"
            :data-build-skip="i !== active ? '' : undefined"
            :inert="i !== active ? true : undefined"
            :aria-label="v.label ? label('visual', v.label) : undefined"
          >
            <component :is="diagrams[v.diagram!]" v-if="v.kind === 'diagram'" />

            <div v-else-if="v.kind === 'code'" class="f-code" data-build="print" data-build-wait>
              <ContentRenderer :value="p" />
            </div>

            <template v-else-if="v.kind === 'chart' && v.chart">
              <a v-if="p.badge" class="f-badge" :href="p.badge.href" target="_blank" rel="noopener">
                <span class="badge-value" data-build="count">{{ p.badge.value }}</span>
                <span class="badge-dim" data-build="line" />
                <span class="badge-label mono" data-build="type">{{ p.badge.label }}, {{ asOf }}</span>
              </a>
              <BarChart :chart="v.chart" />
            </template>

            <div v-else-if="v.kind === 'images'" class="f-images" :class="[`count-${v.images?.length ?? 0}`, { 'is-stack': (v.images?.length ?? 0) > 1 }]">
              <img
                v-for="(img, n) in v.images"
                :key="img.src"
                :src="img.src"
                :alt="img.alt"
                :width="img.width"
                :height="img.height"
                :style="{ ...((v.images?.length ?? 0) > 1 ? stackStyle(n, v.images!.length) : {}), ...(img.width && img.height ? { '--ar': img.width / img.height } : {}) }"
                class="f-shot"
                data-build="image"
                @click="lightbox.open(v.images!, n)"
              >
            </div>
          </div>
        </div>
      </div>

      <div v-if="count > 1" class="f-nav mono" data-build="fade" data-nopen>
        <button type="button" class="f-arrow" :aria-label="t('flagship.prevView')" @click="show(active - 1)">
          <FontAwesomeIcon icon="arrow-left" />
        </button>
        <button
          v-for="(v, i) in visuals"
          :key="i"
          type="button"
          class="f-dot"
          :class="{ 'is-active': i === active }"
          :aria-label="label('visual', v.label ?? v.kind)"
          :aria-current="i === active ? 'true' : undefined"
          @click="show(i)"
        >
          <span class="f-dot-mark" />
          <span class="f-dot-label">{{ label('visual', v.label ?? v.kind) }}</span>
        </button>
        <button type="button" class="f-arrow" :aria-label="t('flagship.nextView')" @click="show(active + 1)">
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.flagship {
  display: grid;
  gap: 24px clamp(40px, 5vw, 88px);
  align-items: center;
}

.visual-left {
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  grid-template-areas: 'visual main';
}

.visual-right {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  grid-template-areas: 'main visual';
}

.f-main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 48ch;
}

.f-visual {
  grid-area: visual;
  min-width: 0;
  min-height: 0;
  max-height: 100%;
}

.f-main h2 {
  font-size: clamp(2.6rem, 6vw, 5rem);
  width: fit-content;
}

.f-tagline {
  margin-top: -6px;
  font-size: 1.2rem;
  color: var(--fg-muted);
}

.f-why {
  font-size: 1.05rem;
}

.f-why strong {
  color: var(--line);
}

.f-body {
  color: var(--fg-muted);
  font-size: 0.95rem;
}

.f-body :deep(p + p) {
  margin-top: 0.6em;
}

.f-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.f-stats {
  font-size: 0.8rem;
  color: var(--fg-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
}

.f-stats b {
  color: var(--fg);
  font-weight: 700;
}

.sep {
  color: var(--line-strong);
}

.f-source {
  color: var(--fg-muted);
}

.f-stack {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.f-links {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.ext {
  font-size: 0.7em;
  margin-left: 2px;
}

.f-images img {
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: var(--surface);
}

/* carousel of visuals: all pages share one grid cell */
.f-track {
  display: grid;
  align-items: start;
}

.f-pane {
  grid-area: 1 / 1;
  min-width: 0;
  visibility: hidden;
}

.f-pane.is-active {
  visibility: visible;
}

.f-pane.is-leaving {
  visibility: visible;
  animation: pane-out 300ms ease forwards;
}

@keyframes pane-out {
  to { opacity: 0; }
}

.f-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  font-size: 0.72rem;
}

.f-nav button {
  font: inherit;
  color: var(--fg-muted);
  background: none;
  border: 0;
  padding: 4px 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.f-nav button:hover {
  color: var(--fg);
}

.f-dot-mark {
  width: 14px;
  height: 10px;
  border: 1px solid var(--line);
}

.f-dot.is-active {
  color: var(--fg);
}

.f-dot.is-active .f-dot-mark {
  background: var(--accent);
  border-color: var(--accent);
}

.pane-chart {
  display: flex;
  flex-direction: column;
  gap: 32px;
}


.f-pane img {
  max-height: calc(100dvh - 300px);
  object-fit: contain;
}

/* several screenshots overlap like a loose stack (placed by stackStyle). The stack lives in a
   box of fixed proportions, so it never grows taller than the sheet: the carousel's hidden pages
   still take up room. */
.f-images.is-stack {
  position: relative;
  aspect-ratio: 1.25;
}

.f-images.is-stack img {
  position: absolute;
  width: auto;
  height: auto;
}

/* Backbone: the code is the picture */
.f-code :deep(pre) {
  border: 0;
  padding: 22px 24px;
  font-size: clamp(0.72rem, 1.05vw, 0.92rem);
  line-height: 1.6;
  overflow-x: auto;
}

/* Helix: the number first */
.project-helix .f-visual {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.f-badge {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
  color: var(--fg);
  text-decoration: none;
}

.badge-value {
  font-family: var(--font-pixel);
  font-weight: 700;
  font-size: clamp(5rem, 13vw, 11rem);
  line-height: 0.9;
  letter-spacing: 0;
}

.badge-dim {
  display: block;
  height: 9px;
  border-left: 1px solid var(--line);
  border-right: 1px solid var(--line);
  background: linear-gradient(var(--line), var(--line)) center / 100% 1px no-repeat;
}

.badge-label {
  font-size: 0.8rem;
  color: var(--fg-muted);
}

.f-badge:hover .badge-label {
  color: var(--line);
}

.project-helix .f-images img {
  image-rendering: pixelated;
}

.f-shot {
  cursor: zoom-in;
}

@media (max-width: 1100px) and (min-width: 768px) {
  .flagship {
    font-size: 0.92rem;
  }
}

@media (max-width: 767px) {
  /* phones: what it is, why it matters, the numbers and the links; no long text or visuals */
  .flagship .f-body,
  .flagship .f-visual {
    display: none;
  }

  .visual-left,
  .visual-right {
    grid-template-columns: 1fr;
    grid-template-areas: 'main' 'visual';
  }
}
</style>
