<script setup lang="ts">
const files = [
  { name: 'my-doc.md', depth: 0 },
  { name: 'setup.md', depth: 0 },
  { name: 'api/', depth: 0 },
  { name: 'nested.md', depth: 1 },
]
const out = ['clay-structure.yaml', 'Clay frontend (Nuxt)', 'docs, logo, config']
</script>

<template>
  <figure class="diagram">
    <svg viewBox="0 0 400 560" role="img" aria-label="Clay: Markdown in docs and clay.yaml go into Clay Oven, which writes the structure file and bundles it with the Clay frontend into a deployable site.">

      <!-- inputs -->
      <rect class="box" x="8" y="8" width="200" height="132" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="34" data-build="fade">docs/</text>
      <text v-for="(f, i) in files" :key="f.name" class="note" :x="22 + f.depth * 16" :y="60 + i * 20" data-build="fade">{{ f.name }}</text>

      <rect class="box" x="236" y="8" width="156" height="44" pathLength="1" data-build="path" data-pen />
      <text class="label" x="250" y="35" data-build="fade">clay.yaml</text>

      <path class="wire" d="M108,140 V200" pathLength="1" data-build="path" />
      <path class="head" d="M103,194 L108,200 L113,194" pathLength="1" data-build="path" />
      <path class="wire" d="M314,52 V200" pathLength="1" data-build="path" />
      <path class="head" d="M309,194 L314,200 L319,194" pathLength="1" data-build="path" />

      <!-- oven -->
      <rect class="box strong" x="8" y="200" width="384" height="84" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="228" data-build="fade">Clay Oven</text>
      <text class="note" x="22" y="250" data-build="fade">Go CLI</text>
      <text class="note" x="22" y="268" data-build="fade">scans docs, writes the structure, bundles</text>

      <path class="wire" d="M200,284 V332" pathLength="1" data-build="path" />
      <path class="head" d="M195,326 L200,332 L205,326" pathLength="1" data-build="path" />

      <!-- output -->
      <rect class="box" x="8" y="332" width="384" height="112" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="358" data-build="fade">dist/</text>
      <text v-for="(f, i) in out" :key="f" class="note" x="22" :y="384 + i * 20" data-build="fade">{{ f }}</text>

      <path class="wire" d="M200,444 V484" pathLength="1" data-build="path" />
      <path class="head" d="M195,478 L200,484 L205,478" pathLength="1" data-build="path" />

      <!-- site -->
      <rect class="box strong" x="8" y="484" width="384" height="68" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="512" data-build="fade">docs site</text>
      <text class="note" x="22" y="534" data-build="fade">static, any host</text>
    </svg>
  </figure>
</template>

<style scoped>
.diagram svg {
  width: 100%;
  height: auto;
  max-height: calc(100dvh - 260px);
  font-family: var(--font-mono);
}

.box {
  fill: none;
  stroke: var(--line-strong);
  stroke-width: 1.2;
}

.box.strong {
  stroke: var(--line);
}

.wire,
.head {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
}

.label {
  font-size: 15px;
  fill: var(--fg);
}

.note {
  font-size: 12px;
  fill: var(--fg-muted);
}
</style>
