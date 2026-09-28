<script setup lang="ts">
import ButterflySprite from './ButterflySprite.vue'
import { pen } from './builder'

// Two layers: construction marks behind the sheets (so they never cross text) and the pen in
// front. The pen jumps to the bottom-right corner of whatever is being drawn and shows where it is.
const gap = ref(0)
onMounted(() => {
  gap.value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--frame-gap')) || 0
})

const pad = (n: number) => String(Math.max(0, Math.round(n - gap.value))).padStart(4, '0')
</script>

<template>
  <div class="guides" aria-hidden="true">
    <!-- only the current element; the key swap removes the previous marks at once -->
    <template v-if="pen.guide" :key="pen.guide.id">
      <!-- extension lines through the corner the pen is on -->
      <div class="mark ext-h" :style="{ top: `${pen.guide!.y + pen.guide!.h}px` }" />
      <div class="mark ext-v" :style="{ left: `${pen.guide!.x + pen.guide!.w}px` }" />
      <div class="mark ext-h faint" :style="{ top: `${pen.guide!.y}px` }" />
      <div class="mark ext-v faint" :style="{ left: `${pen.guide!.x}px` }" />

      <!-- the element's box with corner ticks and its size -->
      <div class="mark box" :style="{ left: `${pen.guide!.x}px`, top: `${pen.guide!.y}px`, width: `${pen.guide!.w}px`, height: `${pen.guide!.h}px` }">
        <span class="corner tl" />
        <span class="corner tr" />
        <span class="corner bl" />
        <span class="corner br" />
        <span v-if="pen.guide!.baseline" class="baseline" />
        <span class="dim dim-w mono">{{ Math.round(pen.guide!.w) }}</span>
        <span class="dim dim-h mono">{{ Math.round(pen.guide!.h) }}</span>
      </div>
    </template>
  </div>

  <div class="pen-layer" aria-hidden="true">
    <div class="pen" :class="{ 'is-visible': pen.visible }" :style="{ transform: `translate(${pen.x}px, ${pen.y}px)`, '--glide': `${pen.glide}ms` }">
      <span class="pen-sprite"><ButterflySprite flap="fast" :scale="1.5" /></span>
      <span class="pen-label mono">x {{ pad(pen.x) }} y {{ pad(pen.y) }}</span>
    </div>
  </div>
</template>

<style scoped>
.guides,
.pen-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* behind the sheets, above the paper */
.guides {
  z-index: 0;
}

/* above the search panel, below the resting butterfly */
.pen-layer {
  z-index: 55;
}

.mark {
  position: absolute;
  animation: mark-in 120ms ease-out both;
}

@keyframes mark-in {
  from { opacity: 0; }
}

.ext-h {
  left: var(--frame-gap);
  right: var(--frame-gap);
  height: 0;
  border-top: 1px dashed var(--line);
}

.ext-v {
  top: var(--frame-gap);
  bottom: var(--frame-gap);
  width: 0;
  border-left: 1px dashed var(--line);
}

.ext-h:not(.faint),
.ext-v:not(.faint) {
  border-color: color-mix(in srgb, var(--line) 60%, transparent);
}

.faint {
  border-color: var(--bg-grid-strong);
}

.box {
  border: 1px dashed color-mix(in srgb, var(--accent) 55%, transparent);
}

.corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 0 solid var(--accent);
  opacity: 0.8;
}

.tl { left: -5px; top: -5px; border-left-width: 1px; border-top-width: 1px; }
.tr { right: -5px; top: -5px; border-right-width: 1px; border-top-width: 1px; }
.bl { left: -5px; bottom: -5px; border-left-width: 1px; border-bottom-width: 1px; }
.br { right: -5px; bottom: -5px; border-right-width: 1px; border-bottom-width: 1px; }

.baseline {
  position: absolute;
  left: -12px;
  right: -12px;
  top: 80%;
  height: 0;
  border-top: 1px solid var(--accent);
}

.dim {
  position: absolute;
  font-size: 10px;
  color: var(--accent);
  white-space: nowrap;
}

.dim-w {
  left: 50%;
  top: -16px;
  transform: translateX(-50%);
}

.dim-h {
  left: -10px;
  top: 50%;
  transform: translate(-100%, -50%);
}

.pen {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transition:
    transform var(--glide, 220ms) cubic-bezier(0.3, 0, 0.2, 1),
    opacity 250ms ease;
}

.pen.is-visible {
  opacity: 1;
}

/* the butterfly is centred on the point being drawn */
.pen-sprite {
  position: absolute;
  left: -20px;
  top: -18px;
  display: block;
  filter: drop-shadow(0 0 1px var(--bg)) drop-shadow(0 0 1px var(--bg));
}

.pen-label {
  position: absolute;
  left: 24px;
  top: 14px;
  font-size: 10px;
  color: var(--accent);
  white-space: nowrap;
  background: var(--bg);
  padding: 0 3px;
}

@media (max-width: 767px), (prefers-reduced-motion: reduce) {
  .guides,
  .pen-layer {
    display: none;
  }
}
</style>
