<script setup lang="ts">
import PixelBush from './PixelBush.vue'
import PixelVine from './PixelVine.vue'
import { pageZoom, unzoomRect } from '~/utils/zoom'

const props = defineProps<{ x: number, total: number }>()

// The grid scrolls with the deck so all sheets read as one long roll of paper.
const offset = computed(() => `calc(${props.x} * calc(var(--vw) * -100))`)

// The run along the top edge hangs off the intro's shortcut buttons: IntroSheet measures where
// the button group starts (page pixels from the left). Before that, the same spot estimated from
// the sheet's right padding.
const linksLeft = useState<number | null>('intro-links-left', () => null)
const fromLinks = (dx: number) => linksLeft.value != null
  ? `${linksLeft.value + dx}px`
  : `calc(100% - var(--frame-gap) - clamp(24px, calc(var(--vw) * 5), 80px) - ${380 - dx}px)`

// The intro's vines: here so they sit under the bushes, moved along with the intro sheet. They grow
// when the intro is drawn and come apart as the deck slides away from it (IntroSheet sets the state).
const vines = useState<'idle' | 'run' | 'done' | 'leaving'>('intro-vines', () => 'idle')
const vineLayer = computed(() => ({
  transform: `translateX(${offset.value})`,
  ...(linksLeft.value != null ? { '--links-left': `${linksLeft.value}px` } : {}),
}))

// ---------- filling gaps on larger or differently shaped windows ----------

type Edge = 'top' | 'bottom' | 'left' | 'right'
interface Filler { key: string, edge: Edge, at: string, seed: number, width: number, height: number, delay: number }

// Gaps up to this long are part of the design (the widest one in the reference window, along the
// top edge, is 498px); longer ones, on windows shaped differently, get small patches.
const MAX_GAP = 520
const SPACING = 280
// kept free: the arrows in the middle of each edge and the title block in the bottom right corner
const ARROW = 56

const root = ref<HTMLElement>()
const fillers = ref<Filler[]>([])
let firstFill = true

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function fill() {
  const z = pageZoom()
  const W = window.innerWidth / z
  const H = window.innerHeight / z
  if (window.innerWidth < 768 || !root.value) {
    fillers.value = []
    return
  }
  const taken: Record<Edge, [number, number][]> = {
    top: [[W / 2 - ARROW, W / 2 + ARROW]],
    bottom: [[W / 2 - ARROW, W / 2 + ARROW]],
    left: [[H / 2 - ARROW, H / 2 + ARROW]],
    right: [[H / 2 - ARROW, H / 2 + ARROW]],
  }
  const block = document.querySelector('.title-block')
  if (block) {
    const r = unzoomRect(block.getBoundingClientRect())
    taken.bottom.push([r.left - 24, W])
    taken.right.push([r.top - 24, H])
  }
  for (const el of root.value.parentElement!.querySelectorAll('.bush:not(.is-filler)')) {
    const r = unzoomRect(el.getBoundingClientRect())
    if (!r.width) continue
    if (r.top <= 2) taken.top.push([r.left, r.right])
    if (r.bottom >= H - 2) taken.bottom.push([r.left, r.right])
    if (r.left <= 2) taken.left.push([r.top, r.bottom])
    if (r.right >= W - 2) taken.right.push([r.top, r.bottom])
  }

  const next: Filler[] = []
  for (const edge of ['top', 'bottom', 'left', 'right'] as Edge[]) {
    const length = edge === 'top' || edge === 'bottom' ? W : H
    const spans = taken[edge].sort((a, b) => a[0] - b[0])
    let from = 0
    for (const [start, end] of [...spans, [length, length] as [number, number]]) {
      const gap = start - from
      if (gap > MAX_GAP) {
        const n = Math.max(1, Math.floor(gap / SPACING))
        for (let i = 1; i <= n; i++) {
          const centre = from + (gap * i) / (n + 1)
          const key = `${edge}-${Math.round(centre / 40)}`
          const seed = hash(key)
          // no bigger than the smallest placed patch (5 x 3)
          const width = 4 + (seed % 2)
          const height = 3
          next.push({
            key,
            edge,
            at: `${Math.round(centre - width * 4)}px`,
            seed,
            width,
            height,
            delay: firstFill ? 3300 + next.length * 150 : next.length * 80,
          })
        }
      }
      from = Math.max(from, end)
    }
  }
  firstFill = false
  fillers.value = next
}

let resizeTimer: ReturnType<typeof setTimeout> | undefined
function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(fill, 150)
}

onMounted(() => {
  requestAnimationFrame(() => fill())
  window.addEventListener('resize', onResize)
})
watch(linksLeft, () => nextTick(() => requestAnimationFrame(() => fill())))
onBeforeUnmount(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div ref="root" class="paper" aria-hidden="true" :style="{ '--offset': offset }" />
  <div
    class="vine-layer"
    :class="{ 'is-idle': vines === 'idle', 'b-run': vines === 'run', 'b-done': vines === 'done', 'is-leaving': vines === 'leaving' }"
    :style="vineLayer"
    aria-hidden="true"
  >
    <PixelVine :seed="5" :length="44" :drift="-0.35" class="vine-a" />
    <PixelVine :seed="17" :length="30" :drift="-0.15" :sway="2" :delay="500" class="vine-b" />
    <PixelVine :seed="29" :length="60" :drift="-0.6" :sway="3" :delay="250" class="vine-c" />
  </div>
  <!-- bushes like the one in the avatar, growing in from the corners (a small one top left) -->
  <PixelBush corner="bottom-left" :seed="7" :height="30" :thickness="11" :mound="0.8" />
  <PixelBush corner="top-right" :seed="23" :delay="1300" :thickness="9" />
  <PixelBush corner="top-left" :seed="44" :delay="2000" :width="20" :height="13" :thickness="7" />
  <!-- and small patches along the edges, some in little groups, clear of the arrows (edge middles)
       and the title block -->
  <PixelBush corner="bottom" at="23%" :seed="41" :delay="1900" :width="17" :height="7" />
  <PixelBush corner="bottom" at="calc(23% + 144px)" :seed="12" :delay="2150" :width="9" :height="5" />
  <PixelBush corner="bottom" at="calc(23% + 224px)" :seed="33" :delay="2350" :width="5" :height="3" />
  <PixelBush corner="bottom" at="41%" :seed="58" :delay="2800" :width="6" :height="3" />
  <PixelBush corner="bottom" at="61%" :seed="74" :delay="3000" :width="11" :height="5" />
  <PixelBush corner="bottom" at="calc(61% + 96px)" :seed="19" :delay="3250" :width="6" :height="3" />
  <PixelBush corner="top" at="14%" :seed="47" :delay="2900" :width="7" :height="3" />
  <!-- a run along the top edge out of the top-right bush, ending at the intro's shortcut buttons:
       the two larger ones are where the intro's vines hang from (IntroSheet.vue: stems 60px and
       230px left of the buttons), small ones in between tie them together, and a sprig trails off -->
  <PixelBush corner="top" :at="fromLinks(8)" :seed="102" :delay="2400" :width="8" :height="3" />
  <PixelBush corner="top" :at="fromLinks(-120)" :seed="71" :delay="2600" :width="15" :height="5" />
  <PixelBush corner="top" :at="fromLinks(-177)" :seed="114" :delay="2750" :width="6" :height="3" />
  <PixelBush corner="top" :at="fromLinks(-274)" :seed="83" :delay="2850" :width="11" :height="4" />
  <PixelBush corner="top" :at="fromLinks(-332)" :seed="126" :delay="3000" :width="5" :height="3" />
  <PixelBush corner="left" at="20%" :seed="91" :delay="3100" :width="7" :height="3" />
  <PixelBush corner="left" at="54%" :seed="63" :delay="2400" :width="14" :height="6" />
  <PixelBush corner="left" at="calc(54% + 120px)" :seed="27" :delay="2700" :width="7" :height="4" />
  <PixelBush corner="right" at="24%" :seed="96" :delay="3200" :width="12" :height="5" />
  <PixelBush corner="right" at="calc(24% + 104px)" :seed="66" :delay="3450" :width="6" :height="3" />
  <PixelBush corner="right" at="68%" :seed="15" :delay="3600" :width="8" :height="4" />
  <!-- more of the same where a large or wide window leaves long gaps between them (fill above) -->
  <PixelBush
    v-for="f in fillers"
    :key="f.key"
    class="is-filler"
    :corner="f.edge"
    :at="f.at"
    :seed="f.seed"
    :delay="f.delay"
    :width="f.width"
    :height="f.height"
  />
</template>

<style scoped>
/* above the paper and the frame line, under the bushes (which come later) and the sheets */
.vine-layer {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  transition: transform var(--transition-duration) var(--transition-ease);
  /* where the intro's shortcut buttons start (measured by IntroSheet; until then estimated) */
  --links-left: calc(100% - var(--frame-gap) - clamp(24px, calc(var(--vw) * 5), 80px) - 380px);
}

.vine-layer.is-idle {
  visibility: hidden;
}

.vine-layer > :deep(.pixel-vine) {
  position: absolute;
}

/* stems left of the buttons, just inside the bottom of the bushes they hang from; they drift
   further left as they grow, away from the buttons */
.vine-a {
  top: 32px;
  left: calc(var(--links-left) - 60px);
}

.vine-b {
  top: 24px;
  left: calc(var(--links-left) - 230px);
}

/* out of the top-right bush, placed by its left edge */
.vine-c {
  top: var(--frame-gap);
  left: 85%;
  margin-left: 0;
}

@media (max-width: 767px) {
  .vine-layer {
    display: none;
  }
}

.paper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: var(--bg);
  background-image:
    linear-gradient(to right, var(--bg-grid-strong) 1px, transparent 1px),
    linear-gradient(to bottom, var(--bg-grid-strong) 1px, transparent 1px),
    linear-gradient(to right, var(--bg-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--bg-grid) 1px, transparent 1px);
  background-size: 96px 96px, 96px 96px, 16px 16px, 16px 16px;
  background-position: var(--offset) 0;
  transition: background-position var(--transition-duration) var(--transition-ease);
}

html.js .paper {
  animation: paper-in 500ms ease both;
}

@keyframes paper-in {
  from { opacity: 0; }
}

@media (max-width: 767px) {
  .paper {
    background-position: 0 0;
    background-attachment: fixed;
  }
}

@media (prefers-reduced-motion: reduce) {
  .paper {
    transition: none;
    animation: none !important;
  }
}
</style>
