<script setup lang="ts">
// Osmium in one picture: the dashboard sends a job to a host, the host runs four agents, and each
// agent builds its own strip of the schematic, bottom layer first, snaking back and forth.
// The builder triggers the fill every time the sheet is drawn.

const COLS = 16
const ROWS = 10
const CELL = 28
const GX = 56 // grid origin
const GY = 262
const STRIP = COLS / 4
const PER_STRIP = STRIP * ROWS
const TOTAL = PER_STRIP * 4
const SPEED = [2600, 3300, 2200, 3700] // ms per strip, agents are not equally fast

const stripX = (s: number) => GX + s * STRIP * CELL
const agentX = (s: number) => stripX(s) + (STRIP * CELL) / 2

// fill order inside one strip: bottom row first, alternating direction
const order = Array.from({ length: PER_STRIP }, (_, i) => {
  const row = ROWS - 1 - Math.floor(i / STRIP)
  const k = i % STRIP
  const col = Math.floor(i / STRIP) % 2 === 0 ? k : STRIP - 1 - k
  return { row, col }
})

const filled = ref([0, 0, 0, 0])
const t = ref(0)
const history = ref<number[]>([])
let raf = 0

const left = computed(() => TOTAL - filled.value.reduce((a, b) => a + b, 0))
const cells = computed(() =>
  filled.value.flatMap((n, s) => order.slice(0, n).map(c => ({ x: stripX(s) + c.col * CELL, y: GY + c.row * CELL, s }))),
)
const working = (s: number) => filled.value[s]! < PER_STRIP && filled.value[s]! > 0
// a packet travelling down each busy wire
const packetY = (s: number) => 196 + ((t.value / 380 + s * 0.27) % 1) * (GY - 196 - 6)
const spark = computed(() => history.value.map((v, i) => `${378 + i * 6},${92 - v * 26}`).join(' '))
const tower = computed(() => 1 - left.value / TOTAL)

const root = ref<SVGGElement>()

function stop() {
  cancelAnimationFrame(raf)
}

function reset() {
  stop()
  filled.value = [0, 0, 0, 0]
  history.value = []
  t.value = 0
}

function finish() {
  stop()
  filled.value = [PER_STRIP, PER_STRIP, PER_STRIP, PER_STRIP]
}

function run(e: Event) {
  const { resolve, signal, speed = 1 } = (e as CustomEvent<{ resolve: () => void, signal: AbortSignal, speed?: number }>).detail
  reset()
  const start = performance.now()
  let last = 0
  let lastSample = start
  const step = (now: number) => {
    if (signal.aborted) return
    t.value = now - start
    filled.value = SPEED.map(ms => Math.min(PER_STRIP, Math.floor((t.value * speed / ms) * PER_STRIP)))
    if (now - lastSample > 120) {
      const placed = TOTAL - left.value
      history.value = [...history.value.slice(-26), Math.min(1, (placed - last) / 7)]
      last = placed
      lastSample = now
    }
    if (left.value > 0) raf = requestAnimationFrame(step)
    else resolve()
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => {
  root.value?.addEventListener('build-run', run)
  root.value?.addEventListener('build-reset', reset)
  root.value?.addEventListener('build-finish', finish)
})
onBeforeUnmount(stop)
</script>

<template>
  <figure class="diagram">
    <svg viewBox="0 0 560 560" role="img" aria-label="Osmium: the dashboard sends a job to a host, the host runs four agents, and each agent builds one strip of the schematic, layer by layer.">

      <!-- dashboard -->
      <rect class="box strong" x="8" y="8" width="544" height="104" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="30" data-build="fade">dashboard</text>

      <rect class="panel" x="22" y="42" width="160" height="56" pathLength="1" data-build="path" />
      <text class="note" x="30" y="56" data-build="fade">map</text>
      <g class="map" data-build="fade">
        <rect v-for="s in 4" :key="s" :x="72 + (s - 1) * 26" :y="92 - 30 * (filled[s - 1]! / PER_STRIP)" width="20" :height="30 * (filled[s - 1]! / PER_STRIP)" />
      </g>

      <rect class="panel" x="194" y="42" width="160" height="56" pathLength="1" data-build="path" />
      <text class="note" x="202" y="56" data-build="fade">3D view</text>
      <g class="iso" data-build="fade" :transform="`translate(290 ${80 - tower * 22})`">
        <path d="M0,-8 L20,0 L0,8 L-20,0 Z" />
        <path :d="`M-20,0 V${tower * 22} L0,${8 + tower * 22} L20,${tower * 22} V0`" />
        <path :d="`M0,8 V${8 + tower * 22}`" />
      </g>

      <rect class="panel" x="366" y="42" width="172" height="56" pathLength="1" data-build="path" />
      <text class="note" x="374" y="56" data-build="fade">blocks left</text>
      <text class="counter" x="530" y="60" text-anchor="end" data-build="fade">{{ left }}</text>
      <polyline class="spark" :points="spark" data-build="fade" />

      <!-- job -->
      <path class="wire" d="M280,112 V150" pathLength="1" data-build="path" />
      <text class="note" x="288" y="136" data-build="fade">job</text>

      <!-- host and agents -->
      <rect class="box" x="8" y="150" width="544" height="46" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="178" data-build="fade">host</text>
      <g v-for="s in 4" :key="`a${s}`">
        <!-- working state on a wrapper: the builder owns the rect's classes -->
        <g :class="{ 'is-working': working(s - 1) }">
          <rect
            class="agent"
            :x="agentX(s - 1) - 10"
            y="163"
            width="20"
            height="20"
            pathLength="1"
            data-build="path"
          />
        </g>
        <text class="note" :x="agentX(s - 1) + 16" y="177" data-build="fade">a{{ s }}</text>
        <path class="wire" :d="`M${agentX(s - 1)},183 V${GY}`" pathLength="1" data-build="path" />
        <rect v-if="working(s - 1)" class="packet" :x="agentX(s - 1) - 3" :y="packetY(s - 1)" width="6" height="6" />
      </g>

      <!-- schematic -->
      <text class="label" :x="GX + 68" :y="GY - 8" data-build="fade">schematic</text>
      <rect class="box strong" :x="GX" :y="GY" :width="COLS * CELL" :height="ROWS * CELL" pathLength="1" data-build="path" data-pen />
      <path
        class="split"
        :d="[1, 2, 3].map(s => `M${stripX(s)},${GY} V${GY + ROWS * CELL}`).join(' ')"
        data-build="fade"
      />
      <g ref="root" data-build="custom" data-pen>
        <rect v-for="(c, i) in cells" :key="i" class="cell" :class="`s${c.s}`" :x="c.x + 2" :y="c.y + 2" :width="CELL - 4" :height="CELL - 4" />
      </g>
      <text v-for="s in 4" :key="`seg${s}`" class="note" :x="stripX(s - 1) + 6" :y="GY + ROWS * CELL + 16" data-build="fade">segment {{ s }}</text>
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

.box,
.panel,
.agent,
.split {
  fill: none;
  stroke: var(--line-strong);
  stroke-width: 1.2;
}

.box.strong {
  stroke: var(--line);
}

.panel {
  stroke: var(--bg-grid-strong);
}

.split {
  stroke-dasharray: 4 4;
}

.agent {
  stroke: var(--line);
}

.is-working .agent {
  fill: var(--accent);
  stroke: var(--accent);
}

.wire {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
}

.packet {
  fill: var(--accent);
}

.cell {
  fill: var(--secondary);
}

.cell.s1,
.cell.s3 {
  fill: var(--line);
}

.map rect {
  fill: var(--line);
}

.iso path {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
}

.spark {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1;
}

.counter {
  font-size: 18px;
  fill: var(--fg);
  font-weight: 700;
}

.label {
  font-size: 13px;
  fill: var(--fg);
}

.note {
  font-size: 10px;
  fill: var(--fg-muted);
}
</style>
