<script setup lang="ts">
import PixelBush from './PixelBush.vue'

const props = defineProps<{ x: number, total: number }>()

// The grid scrolls with the deck so all sheets read as one long roll of paper.
const offset = computed(() => `calc(${props.x} * -100vw)`)
</script>

<template>
  <div class="paper" aria-hidden="true" :style="{ '--offset': offset }" />
  <!-- bushes like the one in the avatar, growing in from two corners -->
  <PixelBush corner="bottom-left" :seed="7" :height="30" :thickness="11" :mound="0.8" />
  <PixelBush corner="top-right" :seed="23" :delay="1300" :thickness="9" />
</template>

<style scoped>
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
