<script setup lang="ts">
// Clay's toolchain: Markdown in docs/ and a hand written clay.yaml go into Clay Oven, a Go CLI
// that writes the navigation structure and bundles it with the prebuilt Clay frontend into a
// static site. Facts from the repository README.

const { t, te } = useI18n()
const d = (key: string) => t(`diagram.clay.${key}`)
// cells hold file names (kept as they are) or words (translated by key)
const cell = (key: string) => (te(`diagram.clay.${key}`) ? d(key) : key)

const docs = [
  { t: 'my-doc.md', x: 22, w: 112 },
  { t: 'setup.md', x: 140, w: 112 },
  { t: 'api/nested.md', x: 22, w: 230, row: 1 },
]
const config = [
  { t: 'title', x: 306, w: 112 },
  { t: 'navbar', x: 424, w: 112 },
  { t: 'languages', x: 306, w: 112, row: 1 },
  { t: 'landing', x: 424, w: 112, row: 1 },
]
const oven = [
  { t: 'scan', x: 22, w: 112 },
  { t: 'clay-structure.yaml', x: 140, w: 136, accent: true },
  { t: 'bundle', x: 282, w: 112 },
]
const site = [
  { t: 'frontend', x: 22, w: 124 },
  { t: 'clay.yaml', x: 152, w: 112 },
  { t: 'clay-structure.yaml', x: 270, w: 136, accent: true },
  { t: 'docs/', x: 412, w: 124 },
]
</script>

<template>
  <figure class="diagram">
    <svg viewBox="0 0 560 460" role="img" :aria-label="d('aria')">
      <!-- inputs -->
      <rect class="box" x="8" y="8" width="260" height="112" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="32" data-build="fade">docs/</text>
      <text class="note" x="254" y="32" text-anchor="end" data-build="fade">Markdown</text>
      <g data-build="fade">
        <g v-for="c in docs" :key="c.t">
          <rect class="cell" :x="c.x" :y="46 + (c.row ?? 0) * 34" :width="c.w" height="26" />
          <text class="cell-text" :x="c.x + c.w / 2" :y="63 + (c.row ?? 0) * 34" text-anchor="middle">{{ cell(c.t) }}</text>
        </g>
      </g>

      <rect class="box" x="292" y="8" width="260" height="112" pathLength="1" data-build="path" data-pen />
      <text class="label" x="306" y="32" data-build="fade">clay.yaml</text>
      <text class="note" x="538" y="32" text-anchor="end" data-build="fade">{{ d('byHand') }}</text>
      <g data-build="fade">
        <g v-for="c in config" :key="c.t">
          <rect class="cell" :x="c.x" :y="46 + (c.row ?? 0) * 34" :width="c.w" height="26" />
          <text class="cell-text" :x="c.x + c.w / 2" :y="63 + (c.row ?? 0) * 34" text-anchor="middle">{{ cell(c.t) }}</text>
        </g>
      </g>

      <!-- inputs → oven -->
      <path class="wire" d="M138,120 V180" pathLength="1" data-build="path" />
      <path class="head" d="M133,174 L138,180 L143,174" pathLength="1" data-build="path" />
      <path class="flow down" d="M138,120 V180" data-build="fade" />
      <path class="wire" d="M346,120 V180" pathLength="1" data-build="path" />
      <path class="head" d="M341,174 L346,180 L351,174" pathLength="1" data-build="path" />
      <path class="flow down" d="M346,120 V180" data-build="fade" />

      <!-- oven -->
      <rect class="box strong" x="8" y="180" width="400" height="100" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="204" data-build="fade">Clay Oven</text>
      <text class="note" x="394" y="204" text-anchor="end" data-build="fade">Go CLI</text>
      <text class="note" x="22" y="224" data-build="fade">{{ d('ovenNote') }}</text>
      <g data-build="fade">
        <g v-for="c in oven" :key="c.t">
          <rect class="cell" :class="{ accent: c.accent }" :x="c.x" y="238" :width="c.w" height="26" />
          <text class="cell-text" :x="c.x + c.w / 2" y="255" text-anchor="middle">{{ cell(c.t) }}</text>
        </g>
      </g>

      <!-- prebuilt frontend, bundled by the oven -->
      <path class="wire dashed" d="M428,230 H408" pathLength="1" data-build="path" />
      <rect class="box" x="428" y="180" width="124" height="100" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="440" y="204">Clay</text>
        <text class="note" x="440" y="224">{{ d('prebuilt') }}</text>
        <text class="note" x="440" y="242">Nuxt · Vue</text>
        <text class="note" x="440" y="260">marked · Shiki</text>
      </g>

      <!-- oven → site -->
      <path class="wire" d="M208,280 V340" pathLength="1" data-build="path" />
      <path class="head" d="M203,334 L208,340 L213,334" pathLength="1" data-build="path" />
      <path class="flow down" d="M208,280 V340" data-build="fade" />
      <text class="note" x="218" y="314" data-build="fade">{{ d('folder') }}</text>

      <!-- site -->
      <rect class="box strong" x="8" y="340" width="544" height="112" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="364" data-build="fade">{{ d('site') }}</text>
      <text class="note" x="538" y="364" text-anchor="end" data-build="fade">{{ d('anyHost') }}</text>
      <text class="note" x="22" y="384" data-build="fade">{{ d('siteNote') }}</text>
      <g data-build="fade">
        <g v-for="c in site" :key="c.t">
          <rect class="cell" :class="{ accent: c.accent }" :x="c.x" y="400" :width="c.w" height="26" />
          <text class="cell-text" :x="c.x + c.w / 2" y="417" text-anchor="middle">{{ cell(c.t) }}</text>
        </g>
      </g>
    </svg>
  </figure>
</template>

<style scoped src="./diagram.css"></style>
