<script setup lang="ts">
// A pixel-art vine in the bushes' greens, hanging down from where it is placed and wandering
// sideways as it goes, with leaves off both sides and a few white flowers. Generated from a seed,
// like the bushes. It grows along its length once its parent build element is drawn (the parent
// has data-build="custom" and gets .b-run / .b-done), and withers from the tip back up and fades
// when the parent gets .is-leaving. Purely decorative.
const props = withDefaults(defineProps<{
  seed?: number
  /** length in vine pixels */
  length?: number
  /** sideways drift per pixel down: negative to the left */
  drift?: number
  /** how far it sways from side to side, in vine pixels */
  sway?: number
  /** ms after its build starts */
  delay?: number
}>(), { seed: 3, length: 36, drift: -0.3, sway: 2.5, delay: 0 })

const PX = 8
const STEM = ['#2c5a2c', '#366834']
const LEAF = ['#629134', '#6ca049', '#6ca049', '#b5b641']
const GROW = 1800

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Cell { x: number, y: number, color: string, delay: number }

const vine = computed(() => {
  const rand = rng(props.seed)
  const L = props.length
  const cells: Cell[] = []
  const flowers: { x: number, y: number, delay: number }[] = []
  const phase = rand() * Math.PI * 2
  const freq = 0.18 + rand() * 0.08
  const at = (t: number) => (t / L) * GROW
  let prev = 0
  let side = rand() < 0.5 ? -1 : 1
  let nextLeaf = 2
  for (let y = 0; y < L; y++) {
    const x = Math.round(props.drift * y + props.sway * Math.sin(y * freq + phase))
    // the stem stays connected when it steps sideways
    for (let s = prev; s !== x; s += Math.sign(x - prev)) {
      cells.push({ x: s, y, color: STEM[1]!, delay: at(y) })
    }
    cells.push({ x, y, color: STEM[Math.floor(rand() * 2)]!, delay: at(y) })
    prev = x
    // a small leaf every few pixels, alternating sides; now and then a flower at its tip
    if (y >= nextLeaf && y < L - 1) {
      const c = () => LEAF[Math.floor(rand() * LEAF.length)]!
      const d = at(y) + 120
      cells.push({ x: x + side, y, color: c(), delay: d }, { x: x + 2 * side, y: y - 1, color: c(), delay: d + 40 }, { x: x + 2 * side, y, color: c(), delay: d + 40 })
      if (rand() < 0.35) cells.push({ x: x + 3 * side, y: y - 1, color: c(), delay: d + 80 })
      if (rand() < 0.22 && y > 4) flowers.push({ x: x + 3 * side, y: y + 1, delay: GROW + 150 + flowers.length * 180 })
      side = -side
      nextLeaf = y + 3 + Math.floor(rand() * 2)
    }
  }
  const xs = cells.map(c => c.x).concat(flowers.flatMap(f => [f.x - 1, f.x + 1]))
  const minX = Math.min(...xs) - 1
  const W = Math.max(...xs) - minX + 2
  return {
    /** where the stem starts, in vine pixels from the left edge */
    start: -minX,
    W,
    H: L + 2,
    cells: cells.map(c => ({ ...c, x: c.x - minX, delay: Math.round(c.delay) })),
    flowers: flowers.map(f => ({ ...f, x: f.x - minX })),
  }
})
</script>

<template>
  <svg
    class="pixel-vine"
    :viewBox="`0 0 ${vine.W} ${vine.H}`"
    :width="vine.W * PX"
    :height="vine.H * PX"
    :style="{ '--delay': `${delay}ms`, '--start': vine.start }"
    aria-hidden="true"
    shape-rendering="crispEdges"
  >
    <rect
      v-for="(c, i) in vine.cells"
      :key="i"
      class="vine-leaf"
      :x="c.x"
      :y="c.y"
      width="1"
      height="1"
      :fill="c.color"
      :style="{ '--t': c.delay / GROW }"
    />
    <g
      v-for="(f, i) in vine.flowers"
      :key="`f${i}`"
      class="vine-flower"
      :style="{ '--t': f.delay / GROW, transformOrigin: `${f.x + 0.5}px ${f.y + 0.5}px` }"
    >
      <rect :x="f.x - 1" :y="f.y" width="1" height="1" class="vine-petal" />
      <rect :x="f.x + 1" :y="f.y" width="1" height="1" class="vine-petal" />
      <rect :x="f.x" :y="f.y - 1" width="1" height="1" class="vine-petal" />
      <rect :x="f.x" :y="f.y + 1" width="1" height="1" class="vine-petal" />
      <rect :x="f.x" :y="f.y" width="1" height="1" class="vine-heart" />
    </g>
  </svg>
</template>

<!-- not scoped: the animation starts from the parent's build state (drafting.css hides it before) -->
<style>
.pixel-vine {
  display: block;
  overflow: visible;
  /* placed by where its stem starts, not by its left edge */
  margin-left: calc(var(--start) * -8px);
}

/* --t: how far along the vine a pixel is, 0 at the top and 1 at the tip (flowers a little later) */
.b-run > .pixel-vine .vine-leaf,
.b-done > .pixel-vine .vine-leaf {
  animation: vine-leaf 220ms steps(2, end) both;
  animation-delay: calc(var(--delay) + var(--t) * 1800ms);
}

@keyframes vine-leaf {
  from { opacity: 0; }
}

.pixel-vine .vine-petal {
  fill: #f4f1e4;
}

.pixel-vine .vine-heart {
  fill: var(--accent);
}

.b-run > .pixel-vine .vine-flower,
.b-done > .pixel-vine .vine-flower {
  animation: vine-bloom 360ms steps(3, end) both;
  animation-delay: calc(var(--delay) + var(--t) * 1800ms);
}

@keyframes vine-bloom {
  from { transform: scale(0); }
}

/* leaving the page: flowers close, then the vine comes apart from the tip back up while it fades */
.is-leaving > .pixel-vine {
  opacity: 0;
  transition: opacity 450ms ease 150ms;
}

.is-leaving > .pixel-vine .vine-leaf {
  animation: vine-wither 160ms steps(2, end) both;
  animation-delay: calc((1 - var(--t)) * 450ms);
}

.is-leaving > .pixel-vine .vine-flower {
  animation: vine-close 200ms steps(2, end) both;
  animation-delay: 0ms;
}

@keyframes vine-wither {
  to { opacity: 0; }
}

@keyframes vine-close {
  to { transform: scale(0); }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-vine .vine-leaf,
  .pixel-vine .vine-flower {
    animation: none !important;
  }
}
</style>
