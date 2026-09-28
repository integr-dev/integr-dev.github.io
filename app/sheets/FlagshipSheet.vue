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
// stat values in the reader's format: a month (2026-08) as a date, 1,400 as 1.400 in German
function value(v: string) {
  if (/^\d{4}-\d{2}$/.test(v)) return formatDate(`${v}-01`, false, locale.value)
  return locale.value === 'de' ? v.replace(/\d{1,3}(?:,\d{3})+/g, n => n.replace(/,/g, '.')) : v
}

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

type Shot = { width?: number, height?: number }
const aspect = (img: Shot) => (img.width && img.height ? img.width / img.height : 16 / 9)
// the shape the screenshots should fill together: about that of the space next to the text
const TARGET = 1.3

/**
 * Screenshots side by side in rows, none overlapping: every row is as tall as its screenshots
 * let it be at full width, so they line up edge to edge. Of all the ways to cut the list into
 * rows (in order), the one whose overall shape comes closest to TARGET wins.
 * ar: width / height of the whole block, without the gaps.
 */
function shotLayout(images: Shot[]) {
  const ars = images.map(aspect)
  const n = ars.length
  let best = { rows: [ars.map((_, i) => i)], ar: 0, cost: Infinity }
  for (let cuts = 0; cuts < 2 ** Math.max(0, n - 1); cuts++) {
    const rows: number[][] = [[0]]
    for (let i = 1; i < n; i++) {
      if (cuts & (1 << (i - 1))) rows.push([i])
      else rows[rows.length - 1]!.push(i)
    }
    if (rows.some(r => r.length > 3)) continue
    const ar = 1 / rows.reduce((sum, r) => sum + 1 / r.reduce((w, i) => w + ars[i]!, 0), 0)
    const cost = Math.abs(Math.log(ar / TARGET))
    if (cost < best.cost) best = { rows, ar, cost }
  }
  return best
}
const layouts = computed(() => visuals.value.map(v => (v.images?.length ? shotLayout(v.images) : null)))

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
          <span><b data-build="count">{{ value(s.value) }}</b> {{ label('stats', s.label) }}</span>
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
        <span class="badge-value" data-build="count">{{ value(p.badge.value) }}</span>
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
                <span class="badge-value" data-build="count">{{ value(p.badge.value) }}</span>
                <span class="badge-dim" data-build="line" />
                <span class="badge-label mono" data-build="type">{{ p.badge.label }}, {{ asOf }}</span>
              </a>
              <BarChart :chart="v.chart" />
            </template>

            <div
              v-else-if="v.kind === 'images' && v.images?.length && layouts[i]"
              class="f-images"
              :style="{ '--layout-ar': layouts[i].ar, '--rows': layouts[i].rows.length }"
            >
              <div v-for="(row, r) in layouts[i].rows" :key="r" class="f-row">
                <!-- a drafting frame: the outline and corner ticks come with the image, the number is typed -->
                <figure
                  v-for="n in row"
                  :key="v.images[n]!.src"
                  class="f-shot"
                  :style="{ '--ar': aspect(v.images[n]!) }"
                  @click="lightbox.open(v.images!, n)"
                >
                  <img
                    :src="v.images[n]!.src"
                    :alt="v.images[n]!.alt"
                    :width="v.images[n]!.width"
                    :height="v.images[n]!.height"
                    data-build="image"
                  >
                  <span class="f-frame" aria-hidden="true" />
                  <figcaption class="f-fig mono" data-build="type" aria-hidden="true">fig.{{ String(n + 1).padStart(2, '0') }}</figcaption>
                </figure>
              </div>
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
  gap: 24px clamp(40px, calc(var(--vw) * 5), 88px);
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
  font-size: clamp(2.6rem, calc(var(--vw) * 6), 5rem);
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

/* screenshots in rows (see shotLayout), as large as the sheet's height allows */
.f-images {
  --gap: 14px;
  --max-h: calc(calc(var(--dvh) * 100) - 300px - (var(--rows) - 1) * var(--gap));

  display: flex;
  flex-direction: column;
  gap: var(--gap);
  width: min(100%, calc(var(--max-h) * var(--layout-ar)));
  margin-inline: auto;
}

.f-row {
  display: flex;
  gap: var(--gap);
}

/* same shape as the image, so a row's screenshots are all as tall as each other */
.f-shot {
  position: relative;
  flex: var(--ar) 1 0%;
  min-width: 0;
  aspect-ratio: var(--ar);
  margin: 0;
  cursor: zoom-in;
}

.f-shot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--surface);
}

.f-frame {
  position: absolute;
  /* over the figure number, so the outline shows all the way round */
  z-index: 1;
  inset: 0;
  border: 1px solid var(--line-strong);
  pointer-events: none;
  transition: border-color 150ms ease;
}

/* corner ticks just outside, like the construction marks while a sheet is drawn */
.f-frame::before {
  content: '';
  position: absolute;
  inset: -5px;
  opacity: 0.8;
  --t: linear-gradient(var(--accent), var(--accent));

  background:
    var(--t) top left / 8px 1px no-repeat,
    var(--t) top left / 1px 8px no-repeat,
    var(--t) top right / 8px 1px no-repeat,
    var(--t) top right / 1px 8px no-repeat,
    var(--t) bottom left / 8px 1px no-repeat,
    var(--t) bottom left / 1px 8px no-repeat,
    var(--t) bottom right / 8px 1px no-repeat,
    var(--t) bottom right / 1px 8px no-repeat;
}

.f-shot:hover .f-frame {
  border-color: var(--accent);
}

/* the figure number sits on the frame's top-left corner */
.f-fig {
  position: absolute;
  left: 0;
  top: 0;
  padding: 1px 6px;
  font-size: 0.66rem;
  color: var(--line);
  background: var(--bg);
  border-right: 1px solid var(--line-strong);
  border-bottom: 1px solid var(--line-strong);
}

/* the frame only once its image is being drawn */
@media (prefers-reduced-motion: no-preference) {
  /* all inside :global, Vue turns a rule with :global(...) into just that part */
  :global(html.js .f-shot:has(> img:not(.b-run, .b-done)) .f-frame) {
    visibility: hidden;
  }
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


/* Backbone: the code is the picture */
.f-code :deep(pre) {
  border: 0;
  padding: 22px 24px;
  font-size: clamp(0.72rem, calc(var(--vw) * 1.05), 0.92rem);
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
  font-weight: var(--font-pixel-weight);
  font-synthesis: none;
  font-size: clamp(5rem, calc(var(--vw) * 13), 11rem);
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
