<script setup lang="ts">
// Osmium's architecture: the dashboard talks to the backend, the backend keeps state in Postgres,
// hosts dial out to the backend and drive the agents, and only the hosts hold Minecraft
// credentials and proxies. Facts from the repository README and package manifests.

const { t } = useI18n()
const d = (key: string, values?: Record<string, unknown>) => t(`diagram.osmium.${key}`, values ?? {})

const backendModules = [
  ['auth', 'accounts', 'hosts', 'agents'],
  ['schematics', 'plans', 'jobs'],
]
const dashboardParts = ['pipeline', 'viewer', 'map', 'storage']
const hosts = [{ x: 8 }, { x: 216 }]
</script>

<template>
  <figure class="diagram">
    <svg viewBox="0 0 560 612" role="img" :aria-label="d('aria')">
      <!-- dashboard -->
      <rect class="box strong" x="8" y="8" width="400" height="92" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="32" data-build="fade">{{ d('dashboard') }}</text>
      <text class="note" x="394" y="32" text-anchor="end" data-build="fade">{{ d('tests', { n: 665 }) }}</text>
      <text class="note" x="22" y="52" data-build="fade">{{ d('dashboardStack') }}</text>
      <g data-build="fade">
        <g v-for="(part, i) in dashboardParts" :key="part">
          <rect class="cell" :x="22 + i * 94" y="64" width="88" height="24" />
          <text class="cell-text" :x="66 + i * 94" y="80" text-anchor="middle">{{ d(part) }}</text>
        </g>
      </g>

      <!-- dashboard ↔ backend -->
      <path class="wire" d="M208,100 V150" pathLength="1" data-build="path" />
      <path class="head" d="M203,144 L208,150 L213,144" pathLength="1" data-build="path" />
      <path class="flow down" d="M208,100 V150" data-build="fade" />
      <text class="note" x="218" y="129" data-build="fade">{{ d('rest') }}</text>

      <!-- backend -->
      <rect class="box strong" x="8" y="150" width="400" height="150" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="174" data-build="fade">{{ d('backend') }}</text>
      <text class="note" x="394" y="174" text-anchor="end" data-build="fade">{{ d('tests', { n: 695 }) }}</text>
      <text class="note" x="22" y="194" data-build="fade">Spring Boot 4.1 · Kotlin · Spring Security · JPA</text>
      <g data-build="fade">
        <template v-for="(row, r) in backendModules" :key="r">
          <g v-for="(m, i) in row" :key="m">
            <rect class="cell" :x="22 + i * 94" :y="208 + r * 36" width="88" height="26" />
            <text class="cell-text" :x="66 + i * 94" :y="225 + r * 36" text-anchor="middle">{{ d(m) }}</text>
          </g>
        </template>
        <rect class="cell accent" x="304" y="244" width="88" height="26" />
        <text class="cell-text" x="348" y="261" text-anchor="middle">WebSocket</text>
      </g>

      <!-- database -->
      <path class="wire" d="M408,225 H440" pathLength="1" data-build="path" />
      <g class="db" data-build="fade" data-pen>
        <path d="M440,190 v70 a56,12 0 0 0 112,0 v-70" />
        <ellipse cx="496" cy="190" rx="56" ry="12" />
        <text class="label" x="496" y="228" text-anchor="middle">PostgreSQL</text>
        <text class="note" x="496" y="246" text-anchor="middle">{{ d('migrations') }}</text>
      </g>

      <!-- hosts dial out to the backend -->
      <g v-for="(h, i) in hosts" :key="`up${i}`">
        <path class="wire" :d="`M${h.x + 96},360 V300`" pathLength="1" data-build="path" />
        <path class="head" :d="`M${h.x + 91},306 L${h.x + 96},300 L${h.x + 101},306`" pathLength="1" data-build="path" />
        <path class="flow up" :d="`M${h.x + 96},360 V300`" data-build="fade" />
      </g>
      <text class="note" x="112" y="336" data-build="fade">{{ d('dialOut') }}</text>

      <!-- hosts -->
      <g v-for="(h, i) in hosts" :key="`host${i}`">
        <rect class="box" :x="h.x" y="360" width="192" height="140" pathLength="1" data-build="path" data-pen />
        <g data-build="fade">
          <text class="label" :x="h.x + 14" y="384">{{ d('host') }}</text>
          <text class="note" :x="h.x + 14" y="402">TypeScript · mineflayer</text>
          <g v-for="a in 3" :key="a">
            <rect class="agent" :x="h.x + 14 + (a - 1) * 30" y="414" width="22" height="22" />
          </g>
          <text class="note" :x="h.x + 110" y="430">{{ d('agents') }}</text>
          <!-- lock: credentials stay here -->
          <path class="lock" :d="`M${h.x + 18},456 v-5 a5,5 0 0 1 10,0 v5`" />
          <rect class="lock-body" :x="h.x + 15" y="456" width="16" height="12" />
          <text class="note key" :x="h.x + 38" y="466">{{ d('secrets') }}</text>
          <text class="note" :x="h.x + 14" y="488">prismarine-auth · SOCKS</text>
        </g>
      </g>
      <text class="note" x="408" y="514" text-anchor="end" data-build="fade">{{ d('hostTests', { n: 702 }) }}</text>

      <!-- host CLI -->
      <path class="wire dashed" d="M408,420 H428" pathLength="1" data-build="path" />
      <rect class="box" x="428" y="394" width="124" height="52" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="440" y="416">osmium-link</text>
        <text class="note" x="440" y="434">{{ d('linkNote') }}</text>
      </g>

      <!-- hosts → Minecraft -->
      <g v-for="(h, i) in hosts" :key="`down${i}`">
        <path class="wire" :d="`M${h.x + 96},500 V548`" pathLength="1" data-build="path" />
        <path class="head" :d="`M${h.x + 91},542 L${h.x + 96},548 L${h.x + 101},542`" pathLength="1" data-build="path" />
        <path class="flow down" :d="`M${h.x + 96},500 V548`" data-build="fade" />
      </g>
      <text class="note" x="112" y="528" data-build="fade">{{ d('protocol') }}</text>

      <rect class="box strong" x="8" y="548" width="400" height="56" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="22" y="572">{{ d('servers') }}</text>
        <text class="note" x="22" y="592">{{ d('serversNote') }}</text>
      </g>
    </svg>
  </figure>
</template>

<style scoped src="./diagram.css"></style>

<style scoped>
.agent {
  fill: color-mix(in srgb, var(--secondary) 40%, transparent);
  stroke: var(--secondary);
}

.lock {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.5;
}

.lock-body {
  fill: var(--accent);
}
</style>
