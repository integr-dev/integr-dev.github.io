<script setup lang="ts">
// Osmium's architecture: the dashboard talks to the backend, the backend keeps state in Postgres,
// hosts dial out to the backend and drive the agents, and only the hosts hold Minecraft
// credentials and proxies. Facts from the repository README and package manifests.

const backendModules = [
  ['auth', 'accounts', 'hosts', 'agents'],
  ['schematics', 'build plans', 'jobs'],
]
const dashboardParts = ['build pipeline', 'world viewer', 'map', 'storage']
const hosts = [{ x: 8 }, { x: 216 }]
</script>

<template>
  <figure class="diagram">
    <svg viewBox="0 0 560 612" role="img" aria-label="Osmium architecture: a Vue dashboard talks to a Spring Boot backend over REST; the backend stores state in PostgreSQL; hosts written in TypeScript dial out to the backend over a WebSocket, hold the Minecraft credentials and proxies, and drive mineflayer agents on Minecraft servers.">
      <!-- dashboard -->
      <rect class="box strong" x="8" y="8" width="400" height="92" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="32" data-build="fade">dashboard</text>
      <text class="note" x="394" y="32" text-anchor="end" data-build="fade">665 tests</text>
      <text class="note" x="22" y="52" data-build="fade">Vue 3 · Pinia · vue-router · OpenAPI client</text>
      <g data-build="fade">
        <g v-for="(part, i) in dashboardParts" :key="part">
          <rect class="cell" :x="22 + i * 94" y="64" width="88" height="24" />
          <text class="cell-text" :x="66 + i * 94" y="80" text-anchor="middle">{{ part }}</text>
        </g>
      </g>

      <!-- dashboard ↔ backend -->
      <path class="wire" d="M208,100 V150" pathLength="1" data-build="path" />
      <path class="head" d="M203,144 L208,150 L213,144" pathLength="1" data-build="path" />
      <path class="flow down" d="M208,100 V150" data-build="fade" />
      <text class="note" x="218" y="129" data-build="fade">REST (OpenAPI) + JWT, live updates</text>

      <!-- backend -->
      <rect class="box strong" x="8" y="150" width="400" height="150" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="174" data-build="fade">backend</text>
      <text class="note" x="394" y="174" text-anchor="end" data-build="fade">695 tests</text>
      <text class="note" x="22" y="194" data-build="fade">Spring Boot 4.1 · Kotlin · Spring Security · JPA</text>
      <g data-build="fade">
        <template v-for="(row, r) in backendModules" :key="r">
          <g v-for="(m, i) in row" :key="m">
            <rect class="cell" :x="22 + i * 94" :y="208 + r * 36" width="88" height="26" />
            <text class="cell-text" :x="66 + i * 94" :y="225 + r * 36" text-anchor="middle">{{ m }}</text>
          </g>
        </template>
        <rect class="cell socket" x="304" y="244" width="88" height="26" />
        <text class="cell-text" x="348" y="261" text-anchor="middle">WebSocket</text>
      </g>

      <!-- database -->
      <path class="wire" d="M408,225 H440" pathLength="1" data-build="path" />
      <g class="db" data-build="fade" data-pen>
        <path d="M440,190 v70 a56,12 0 0 0 112,0 v-70" />
        <ellipse cx="496" cy="190" rx="56" ry="12" />
        <text class="label" x="496" y="228" text-anchor="middle">PostgreSQL</text>
        <text class="note" x="496" y="246" text-anchor="middle">Flyway migrations</text>
      </g>

      <!-- hosts dial out to the backend -->
      <g v-for="(h, i) in hosts" :key="`up${i}`">
        <path class="wire" :d="`M${h.x + 96},360 V300`" pathLength="1" data-build="path" />
        <path class="head" :d="`M${h.x + 91},306 L${h.x + 96},300 L${h.x + 101},306`" pathLength="1" data-build="path" />
        <path class="flow up" :d="`M${h.x + 96},360 V300`" data-build="fade" />
      </g>
      <text class="note" x="112" y="336" data-build="fade">WebSocket, hosts dial out</text>

      <!-- hosts -->
      <g v-for="(h, i) in hosts" :key="`host${i}`">
        <rect class="box" :x="h.x" y="360" width="192" height="140" pathLength="1" data-build="path" data-pen />
        <g data-build="fade">
          <text class="label" :x="h.x + 14" y="384">host</text>
          <text class="note" :x="h.x + 14" y="402">TypeScript · mineflayer</text>
          <g v-for="a in 3" :key="a">
            <rect class="agent" :x="h.x + 14 + (a - 1) * 30" y="414" width="22" height="22" />
          </g>
          <text class="note" :x="h.x + 110" y="430">agents</text>
          <!-- lock: credentials stay here -->
          <path class="lock" :d="`M${h.x + 18},456 v-5 a5,5 0 0 1 10,0 v5`" />
          <rect class="lock-body" :x="h.x + 15" y="456" width="16" height="12" />
          <text class="note key" :x="h.x + 38" y="466">credentials, proxies</text>
          <text class="note" :x="h.x + 14" y="488">prismarine-auth · SOCKS</text>
        </g>
      </g>
      <text class="note" x="408" y="514" text-anchor="end" data-build="fade">host program: 702 tests</text>

      <!-- host CLI -->
      <path class="wire dashed" d="M408,420 H428" pathLength="1" data-build="path" />
      <rect class="box" x="428" y="394" width="124" height="52" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="440" y="416">osmium-link</text>
        <text class="note" x="440" y="434">accounts, proxies</text>
      </g>

      <!-- hosts → Minecraft -->
      <g v-for="(h, i) in hosts" :key="`down${i}`">
        <path class="wire" :d="`M${h.x + 96},500 V548`" pathLength="1" data-build="path" />
        <path class="head" :d="`M${h.x + 91},542 L${h.x + 96},548 L${h.x + 101},542`" pathLength="1" data-build="path" />
        <path class="flow down" :d="`M${h.x + 96},500 V548`" data-build="fade" />
      </g>
      <text class="note" x="112" y="528" data-build="fade">Minecraft protocol, through the proxies</text>

      <rect class="box strong" x="8" y="548" width="400" height="56" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="22" y="572">Minecraft servers</text>
        <text class="note" x="22" y="592">where the agents walk, fly and build</text>
      </g>
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

.cell {
  fill: color-mix(in srgb, var(--line) 10%, transparent);
  stroke: var(--bg-grid-strong);
}

.cell.socket {
  stroke: var(--accent);
}

.cell-text {
  font-size: 10px;
  fill: var(--fg);
}

.wire,
.head {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
}

.wire.dashed {
  stroke-dasharray: 3 3;
}

/* traffic moving along the wires once the sheet is drawn */
.flow {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
  stroke-dasharray: 3 12;
  opacity: 0;
}

.is-built .flow {
  opacity: 0.9;
  animation: flow 1.2s linear infinite;
}

.is-built .flow.up {
  animation-direction: reverse;
}

@keyframes flow {
  to { stroke-dashoffset: -30; }
}

.db path,
.db ellipse {
  fill: none;
  stroke: var(--line);
  stroke-width: 1.2;
}

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

.key {
  fill: var(--accent);
}

.label {
  font-size: 13px;
  fill: var(--fg);
}

.note {
  font-size: 10px;
  fill: var(--fg-muted);
}

@media (prefers-reduced-motion: reduce) {
  .is-built .flow {
    animation: none;
  }
}
</style>
