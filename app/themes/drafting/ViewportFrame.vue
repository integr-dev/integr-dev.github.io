<script setup lang="ts">
// The fixed drawing frame around the viewport. On load a pen dot traces it once.
const svg = ref<SVGSVGElement>()
const motion = ref<SVGAnimateMotionElement>()
const size = ref({ w: 0, h: 0 })
const drawn = ref(false)

const path = computed(() => {
  const { w, h } = size.value
  return `M0.5,0.5 H${w - 0.5} V${h - 0.5} H0.5 Z`
})

function measure() {
  const el = svg.value
  if (!el) return
  const r = el.getBoundingClientRect()
  size.value = { w: Math.round(r.width), h: Math.round(r.height) }
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    drawn.value = true
    return
  }
  nextTick(() => {
    motion.value?.beginElement()
    setTimeout(() => (drawn.value = true), 1150)
  })
})

onBeforeUnmount(() => window.removeEventListener('resize', measure))
</script>

<template>
  <svg ref="svg" class="frame" :class="{ 'is-drawn': drawn }" aria-hidden="true">
    <template v-if="size.w">
      <path class="frame-line" :d="path" pathLength="1" />
      <!-- tick marks at the edge midpoints, like registration marks -->
      <g class="frame-ticks">
        <line :x1="size.w / 2" y1="0" :x2="size.w / 2" y2="8" />
        <line :x1="size.w / 2" :y1="size.h" :x2="size.w / 2" :y2="size.h - 8" />
        <line x1="0" :y1="size.h / 2" x2="8" :y2="size.h / 2" />
        <line :x1="size.w" :y1="size.h / 2" :x2="size.w - 8" :y2="size.h / 2" />
      </g>
      <circle v-if="!drawn" class="pen" r="3.5">
        <animateMotion ref="motion" :path="path" dur="1.1s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.65 0 0.35 1" />
      </circle>
    </template>
  </svg>
</template>

<style scoped>
.frame {
  position: fixed;
  inset: var(--frame-gap);
  width: calc(100vw - 2 * var(--frame-gap));
  height: calc(100dvh - 2 * var(--frame-gap));
  z-index: 20;
  pointer-events: none;
  overflow: visible;
}

.frame-line {
  fill: none;
  stroke: var(--line-strong);
  stroke-width: 1;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: trace 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.frame-ticks line {
  stroke: var(--line-strong);
  stroke-width: 1;
  opacity: 0;
  transition: opacity 300ms ease;
}

.is-drawn .frame-ticks line {
  opacity: 1;
}

.pen {
  fill: var(--accent);
}

@keyframes trace {
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .frame-line {
    animation: none;
    stroke-dashoffset: 0;
  }
}

@media (max-width: 767px) {
  .frame {
    display: none;
  }
}
</style>
