<script setup lang="ts">
import PixelBush from './PixelBush.vue'

const props = defineProps<{ x: number, total: number }>()

// The grid scrolls with the deck so all sheets read as one long roll of paper.
const offset = computed(() => `calc(${props.x} * -100vw)`)
</script>

<template>
  <div class="paper" aria-hidden="true" :style="{ '--offset': offset }" />
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
  <!-- a run along the top edge out of the top-right bush: the two larger ones are where the intro's
       vines hang from (IntroSheet.vue: stems 440px and 610px left of the sheet's right padding),
       small ones in between tie them together, and a sprig trails off at the end -->
  <PixelBush corner="top" at="calc(100% - var(--frame-gap) - clamp(24px, 5vw, 80px) - 372px)" :seed="102" :delay="2400" :width="8" :height="3" />
  <PixelBush corner="top" at="calc(100% - var(--frame-gap) - clamp(24px, 5vw, 80px) - 500px)" :seed="71" :delay="2600" :width="15" :height="5" />
  <PixelBush corner="top" at="calc(100% - var(--frame-gap) - clamp(24px, 5vw, 80px) - 557px)" :seed="114" :delay="2750" :width="6" :height="3" />
  <PixelBush corner="top" at="calc(100% - var(--frame-gap) - clamp(24px, 5vw, 80px) - 654px)" :seed="83" :delay="2850" :width="11" :height="4" />
  <PixelBush corner="top" at="calc(100% - var(--frame-gap) - clamp(24px, 5vw, 80px) - 712px)" :seed="126" :delay="3000" :width="5" :height="3" />
  <PixelBush corner="left" at="20%" :seed="91" :delay="3100" :width="7" :height="3" />
  <PixelBush corner="left" at="54%" :seed="63" :delay="2400" :width="14" :height="6" />
  <PixelBush corner="left" at="calc(54% + 120px)" :seed="27" :delay="2700" :width="7" :height="4" />
  <PixelBush corner="right" at="24%" :seed="96" :delay="3200" :width="12" :height="5" />
  <PixelBush corner="right" at="calc(24% + 104px)" :seed="66" :delay="3450" :width="6" :height="3" />
  <PixelBush corner="right" at="68%" :seed="15" :delay="3600" :width="8" :height="4" />
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
