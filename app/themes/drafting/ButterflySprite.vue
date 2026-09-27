<script setup lang="ts">
// The yellow pixel butterfly from the avatar. 9 x 8 pixels, drawn at 3x.
const props = withDefaults(defineProps<{ flap?: 'rest' | 'fast', scale?: number }>(), { flap: 'rest', scale: 1 })

const sprite = [
  '...B.B...',
  'YY..B..YY',
  'YYY.B.YYY',
  'YYYYBYYYY',
  '.YYYBYYY.',
  '..YYBYY..',
  '.YY.B.YY.',
  '.Y.....Y.',
]
const pixels = sprite.flatMap((row, y) =>
  [...row].map((c, x) => ({ x, y, c })).filter(p => p.c !== '.'),
)
const wings = pixels.filter(p => p.c === 'Y')
const body = pixels.filter(p => p.c === 'B')
</script>

<template>
  <svg class="sprite" :class="`flap-${flap}`" :width="27 * props.scale" :height="24 * props.scale" viewBox="0 0 9 8" shape-rendering="crispEdges" aria-hidden="true">
    <g class="wings">
      <rect v-for="p in wings" :key="`${p.x}-${p.y}`" :x="p.x" :y="p.y" width="1" height="1" />
    </g>
    <g class="body">
      <rect v-for="p in body" :key="`${p.x}-${p.y}`" :x="p.x" :y="p.y" width="1" height="1" />
    </g>
  </svg>
</template>

<style scoped>
.sprite {
  display: block;
  overflow: visible;
}

.wings {
  fill: var(--accent);
  transform-origin: 4.5px 4px;
  animation: flap 3.2s steps(1) infinite;
}

.flap-fast .wings {
  animation: flap-fast 0.24s steps(1) infinite;
}

.body {
  fill: var(--line-strong);
}

@keyframes flap {
  0%, 88%, 100% { transform: scaleX(1); }
  90%, 94% { transform: scaleX(0.34); }
  92%, 96% { transform: scaleX(1); }
}

@keyframes flap-fast {
  0% { transform: scaleX(1); }
  50% { transform: scaleX(0.34); }
}
</style>
