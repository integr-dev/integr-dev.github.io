<script setup lang="ts">
// A pixel-art bush like the one in the avatar, growing out of a corner of the page, with small
// white flowers opening on it once it has grown. Generated from a seed, so the server and the
// browser draw the same bush. Purely decorative. Placed on an edge instead of a corner, it is a
// small patch: a low mound standing on that edge, growing out from the middle of its base.
const props = withDefaults(defineProps<{
  corner: 'bottom-left' | 'top-right' | 'top-left' | 'bottom' | 'top' | 'left' | 'right'
  /** patches only: where along the edge, from the left (top, bottom) or the top (left, right) */
  at?: string
  seed?: number
  /** ms before it starts growing, on the old page clock: 900 is the moment the first sheet starts
   *  to be drawn (html.is-drawing), which is when the bushes' clock now starts */
  delay?: number
  /** size in bush pixels: the arm along the horizontal edge, the arm along the vertical edge */
  width?: number
  height?: number
  /** how far the bush reaches in from the edges, at the corner */
  thickness?: number
  /** size of the round mound at the corner, relative to the thickness: lower is more L-shaped */
  mound?: number
}>(), { seed: 7, delay: 900, width: 48, height: 26, thickness: 14, mound: 1 })

const PX = 8 // one pixel of the bush, in CSS px (half a grid square)
const W = props.width
const H = props.height
// the avatar's bush, dark to light
const PALETTE = ['#2c5a2c', '#366834', '#629134', '#6ca049', '#b5b641', '#d4d25a']
const GROW = 1400 // ms from the first to the last leaf
const PATCH = !props.corner.includes('-')
const FLOWERS = PATCH ? (W >= 10 ? 2 : 1) : Math.round((W + H) / 8)

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
interface Flower { x: number, y: number, delay: number }

const bush = computed(() => {
  const rand = rng(props.seed)
  if (PATCH) return grow(rand, patchClumps(rand))
  // leaf clumps along both edges, an L around the corner (0, 0 is the corner): thickest at the
  // corner and thinner further out, so the bush hugs the edges and stays out of the content
  const T = props.thickness
  const clumps: { x: number, y: number, r: number }[] = []
  const arm = (length: number, along: 'x' | 'y') => {
    const n = Math.max(2, Math.round(length / 3))
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1)
      const r = T * (0.4 + rand() * 0.2) * (1 - 0.6 * f)
      const a = f * length * 0.92 + (rand() - 0.5) * 2
      const b = r * 0.5 + rand() * 1.5
      clumps.push(along === 'x' ? { x: a, y: b, r } : { x: b, y: a, r })
    }
  }
  arm(W, 'x')
  arm(H, 'y')
  // a round mound at the corner that the two arms grow out of
  const M = props.mound
  clumps.push({ x: 3, y: 3, r: T * 1.05 * M }, { x: T * 0.9, y: T * 0.45, r: T * 0.8 * M }, { x: T * 0.45, y: T * 0.9, r: T * 0.8 * M })
  return grow(rand, clumps)
})

/** A patch: a few clumps side by side on the base line, the middle one tallest. */
function patchClumps(rand: () => number) {
  const n = 3
  return Array.from({ length: n }, (_, i) => {
    const f = i / (n - 1) - 0.5
    return { x: W / 2 + f * W * 0.5 + (rand() - 0.5) * 1.5, y: 0, r: H * (1 - Math.abs(f) * 0.6) * (0.85 + rand() * 0.15) }
  })
}

function grow(rand: () => number, clumps: { x: number, y: number, r: number }[]) {
  const cells: Cell[] = []
  const filled = new Set<string>()
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let best: { dx: number, dy: number, d: number } | null = null
      for (const c of clumps) {
        const dx = x + 0.5 - c.x
        const dy = y + 0.5 - c.y
        const d = Math.hypot(dx, dy) / c.r
        if (!best || d < best.d) best = { dx: dx / c.r, dy: dy / c.r, d }
      }
      // a ragged edge, like leaves
      if (!best || best.d > 1 - rand() * 0.28) continue
      filled.add(`${x},${y}`)
      // light from above: the far side of each clump is lighter, the side toward the corner darker
      const shade = 0.5 + best.dy * 0.35 - best.dx * 0.12 - best.d * 0.25 + (rand() - 0.5) * 0.45
      const idx = Math.max(0, Math.min(PALETTE.length - 1, Math.floor(shade * PALETTE.length)))
      // grows out from the corner along both arms; a patch from the middle of its base
      const dist = PATCH ? Math.min(1, Math.hypot((x - W / 2) / (W / 2), y / H)) : Math.min(1, Math.max(x / W, y / H))
      cells.push({ x, y, color: PALETTE[idx]!, delay: Math.round(dist * GROW + rand() * 180) })
    }
  }

  // flowers on the inner edge of either arm, away from the corner, opening once the bush is grown;
  // on a patch, along its top
  const edge = PATCH
    ? cells.filter(c => c.y > 0 && !filled.has(`${c.x},${c.y + 1}`))
    : cells.filter(c => Math.max(c.x / W, c.y / H) > 0.15
      && (c.x > c.y ? !filled.has(`${c.x},${c.y + 1}`) : !filled.has(`${c.x + 1},${c.y}`)))
  const flowers: Flower[] = []
  for (let i = 0; i < FLOWERS && edge.length; i++) {
    const c = edge.splice(Math.floor(rand() * edge.length), 1)[0]!
    if (flowers.some(f => Math.abs(f.x - c.x) < 4 && Math.abs(f.y - c.y) < 3)) continue
    flowers.push({ x: c.x, y: c.y, delay: (PATCH ? GROW / 2 : GROW) + 200 + i * 160 + Math.round(rand() * 120) })
  }
  return { cells, flowers }
}
</script>

<template>
  <svg
    class="bush"
    :class="`bush-${corner}`"
    :viewBox="`0 0 ${W} ${H}`"
    :width="W * PX"
    :height="H * PX"
    :style="{ '--delay': `${delay - 900}ms`, '--at': at }"
    aria-hidden="true"
    shape-rendering="crispEdges"
  >
    <!-- y is flipped so the bush stands on the bottom edge; the top-right one is turned round by CSS -->
    <g :transform="`translate(0 ${H}) scale(1 -1)`">
      <rect
        v-for="(c, i) in bush.cells"
        :key="i"
        class="leaf"
        :x="c.x"
        :y="c.y"
        width="1"
        height="1"
        :fill="c.color"
        :style="{ animationDelay: `calc(var(--delay) + ${c.delay}ms)` }"
      />
      <g
        v-for="(f, i) in bush.flowers"
        :key="`f${i}`"
        class="flower"
        :style="{ animationDelay: `calc(var(--delay) + ${f.delay}ms)`, transformOrigin: `${f.x + 0.5}px ${f.y + 0.5}px` }"
      >
        <rect :x="f.x - 1" :y="f.y" width="1" height="1" class="petal" />
        <rect :x="f.x + 1" :y="f.y" width="1" height="1" class="petal" />
        <rect :x="f.x" :y="f.y - 1" width="1" height="1" class="petal" />
        <rect :x="f.x" :y="f.y + 1" width="1" height="1" class="petal" />
        <rect :x="f.x" :y="f.y" width="1" height="1" class="heart" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.bush {
  position: fixed;
  /* over the frame line, under the sheets (which come later in the page) */
  z-index: 1;
  pointer-events: none;
  overflow: visible;
}

.bush-bottom-left {
  left: 0;
  bottom: 0;
}

/* the same kind of bush hanging from the top right corner */
.bush-top-right {
  right: 0;
  top: 0;
  transform: scale(-1, -1);
}

/* a smaller one hanging from the top left corner */
.bush-top-left {
  left: 0;
  top: 0;
  transform: scaleY(-1);
}

/* patches: standing on an edge, the base on the edge and the leaves pointing into the page */
.bush-bottom {
  bottom: 0;
  left: var(--at);
}

.bush-top {
  top: 0;
  left: var(--at);
  transform: scaleY(-1);
}

.bush-left {
  left: 0;
  top: var(--at);
  transform-origin: top left;
  transform: rotate(90deg) translateY(-100%);
}

.bush-right {
  right: 0;
  top: var(--at);
  transform-origin: top right;
  transform: rotate(-90deg) translateY(-100%);
}

/* leaves appear one by one, outward from the corner, once the first sheet starts to be drawn */
html.is-drawing .leaf {
  animation: leaf 220ms steps(2, end) both;
}

/* before that: nothing yet (only where it will be animated in) */
@media (prefers-reduced-motion: no-preference) {
  html.js:not(.is-drawing) .leaf {
    opacity: 0;
  }

  html.js:not(.is-drawing) .flower {
    transform: scale(0);
  }
}

@keyframes leaf {
  from { opacity: 0; }
}

.petal {
  fill: #f4f1e4;
}

.heart {
  fill: var(--accent);
}

/* flowers open from their centre */
html.is-drawing .flower {
  animation: bloom 360ms steps(3, end) both;
}

@keyframes bloom {
  from { transform: scale(0); }
}

/* none on phones: the screen is for the content */
@media (max-width: 767px) {
  .bush {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  html.is-drawing .leaf,
  html.is-drawing .flower {
    animation: none;
  }
}
</style>
