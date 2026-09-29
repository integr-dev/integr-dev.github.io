<script setup lang="ts">
import { useLightbox } from '~/composables/useLightbox'
import { theme } from '~/themes/active'

// Large preview of a screenshot. ←/→ move through the screenshots of the same project,
// Esc or a click outside the image closes it. It is drawn in like a sheet: the frame is ruled,
// then the picture is drawn block by block like the screenshots on the page; closing runs the
// frame backwards.
const lightbox = useLightbox()
const closeBtn = ref<HTMLButtonElement>()
const pic = ref<HTMLElement>()
let ctrl: AbortController | undefined

const current = computed(() => {
  const s = lightbox.state.value
  return s ? s.images[s.index] : null
})
const count = computed(() => lightbox.state.value?.images.length ?? 0)

function onKey(e: KeyboardEvent) {
  if (!lightbox.isOpen.value) return
  if (e.key === 'Escape') lightbox.close()
  else if (e.key === 'ArrowRight') lightbox.step(1)
  else if (e.key === 'ArrowLeft') lightbox.step(-1)
  else return
  e.preventDefault()
  e.stopImmediatePropagation()
}

watch(lightbox.isOpen, (open) => {
  if (open) nextTick(() => closeBtn.value?.focus())
})

/** Draw the picture with the page's builder; on opening once the first edges are ruled. */
function draw(delay: number) {
  ctrl?.abort()
  const root = pic.value
  if (!root) return
  const c = (ctrl = new AbortController())
  theme.builder.reset(root)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    theme.builder.finish(root)
    return
  }
  setTimeout(() => {
    if (!c.signal.aborted) theme.builder.run(root, { signal: c.signal, onProgress: () => {} })
  }, delay)
}

watch(() => current.value?.src, (src, old) => {
  if (!src) ctrl?.abort()
  else nextTick(() => draw(old ? 0 : 200))
})

onMounted(() => window.addEventListener('keydown', onKey, { capture: true }))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, { capture: true }))
</script>

<template>
  <Transition name="lb" :duration="{ enter: 760, leave: 560 }">
    <div v-if="current" class="lb" role="dialog" aria-modal="true" :aria-label="current.alt" @click.self="lightbox.close()">
      <figure class="lb-frame">
        <!-- its own build root, drawn without the pen (data-nopen) -->
        <div ref="pic" class="lb-pic" data-build-root data-nopen>
          <img
            :key="current.src"
            :src="current.src"
            :alt="current.alt"
            :width="current.width"
            :height="current.height"
            data-build="image"
          >
          <span class="lb-edge lb-top" aria-hidden="true" />
          <span class="lb-edge lb-right" aria-hidden="true" />
          <span class="lb-edge lb-bottom" aria-hidden="true" />
          <span class="lb-edge lb-left" aria-hidden="true" />
          <span class="lb-ticks" aria-hidden="true" />
        </div>
        <figcaption class="lb-caption mono">
          <span>{{ current.alt }}</span>
          <span v-if="count > 1" class="lb-count">{{ (lightbox.state.value?.index ?? 0) + 1 }} / {{ count }}</span>
        </figcaption>
      </figure>

      <button v-if="count > 1" type="button" data-fill class="lb-btn lb-prev" :aria-label="$t('lightbox.prev')" @click="lightbox.step(-1)">
        <FontAwesomeIcon icon="arrow-left" />
      </button>
      <button v-if="count > 1" type="button" data-fill class="lb-btn lb-next" :aria-label="$t('lightbox.next')" @click="lightbox.step(1)">
        <FontAwesomeIcon icon="arrow-right" />
      </button>
      <button ref="closeBtn" type="button" data-fill class="lb-btn lb-close mono" :aria-label="$t('lightbox.close')" @click="lightbox.close()">
        esc
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 56px 88px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  cursor: zoom-out;
}

.lb-frame {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
  max-height: 100%;
  cursor: default;
}

.lb-pic {
  position: relative;
  align-self: center;
}

.lb-frame img {
  display: block;
  max-width: min(1600px, calc(calc(var(--vw) * 100) - 176px));
  max-height: calc(calc(var(--dvh) * 100) - 150px);
  width: auto;
  height: auto;
  object-fit: contain;
  background: var(--surface);
}

/* the frame: four ruled edges and accent corner ticks, like a screenshot on its sheet */
.lb-edge {
  position: absolute;
  background: var(--line-strong);
  pointer-events: none;
}

.lb-top,
.lb-bottom {
  left: 0;
  right: 0;
  height: 1px;
}

.lb-left,
.lb-right {
  top: 0;
  bottom: 0;
  width: 1px;
}

.lb-top { top: 0; transform-origin: left; }
.lb-right { right: 0; transform-origin: top; }
.lb-bottom { bottom: 0; transform-origin: right; }
.lb-left { left: 0; transform-origin: bottom; }

.lb-ticks {
  --t: linear-gradient(var(--accent), var(--accent));

  position: absolute;
  inset: -6px;
  pointer-events: none;
  opacity: 0.8;
  background:
    var(--t) top left / 10px 1px no-repeat,
    var(--t) top left / 1px 10px no-repeat,
    var(--t) top right / 10px 1px no-repeat,
    var(--t) top right / 1px 10px no-repeat,
    var(--t) bottom left / 10px 1px no-repeat,
    var(--t) bottom left / 1px 10px no-repeat,
    var(--t) bottom right / 10px 1px no-repeat,
    var(--t) bottom right / 1px 10px no-repeat;
}


/* pixel art (Helix) stays crisp when enlarged */
.lb-frame img[src*='helix'] {
  image-rendering: pixelated;
}

.lb-caption {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.lb-count {
  color: var(--line);
  white-space: nowrap;
}

.lb-btn {
  position: fixed;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font: inherit;
  font-size: 0.8rem;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line-strong);
  cursor: pointer;
}

.lb-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.lb-prev {
  left: 24px;
  top: 50%;
  translate: 0 -50%;
}

.lb-next {
  right: 24px;
  top: 50%;
  translate: 0 -50%;
}

.lb-close {
  top: 24px;
  right: 24px;
}

/* opening: the backdrop fades in, the edges are ruled one after another round the frame, the
   picture is drawn block by block (draw), then ticks, caption and buttons. Closing: all of it backwards. */
.lb-enter-active {
  transition: opacity 160ms ease;
}

.lb-leave-active {
  transition: opacity 160ms ease 400ms;
}

.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .lb-enter-active .lb-top { animation: lb-rule-x 160ms ease-out 60ms both; }
  .lb-enter-active .lb-right { animation: lb-rule-y 140ms ease-out 200ms both; }
  .lb-enter-active .lb-bottom { animation: lb-rule-x 160ms ease-out 320ms both; }
  .lb-enter-active .lb-left { animation: lb-rule-y 140ms ease-out 460ms both; }

  .lb-enter-active :is(.lb-ticks, .lb-caption, .lb-btn) {
    animation: lb-fade 180ms ease 580ms both;
  }

  .lb-leave-active :is(.lb-ticks, .lb-caption, .lb-btn) {
    animation: lb-fade 120ms ease reverse both;
  }

  .lb-leave-active img { animation: lb-print 260ms steps(6, end) 60ms reverse both; }
  .lb-leave-active .lb-left { animation: lb-rule-y 100ms ease-in 180ms reverse both; }
  .lb-leave-active .lb-bottom { animation: lb-rule-x 110ms ease-in 260ms reverse both; }
  .lb-leave-active .lb-right { animation: lb-rule-y 100ms ease-in 350ms reverse both; }
  .lb-leave-active .lb-top { animation: lb-rule-x 110ms ease-in 430ms reverse both; }
}

@keyframes lb-rule-x {
  from { transform: scaleX(0); }
}

@keyframes lb-rule-y {
  from { transform: scaleY(0); }
}

@keyframes lb-print {
  from { clip-path: inset(0 0 100% 0); }
  to { clip-path: inset(0 0 0 0); }
}

@keyframes lb-fade {
  from { opacity: 0; }
}

@media (max-width: 767px) {
  .lb {
    padding: 64px 12px;
  }

  .lb-frame img {
    max-width: calc(calc(var(--vw) * 100) - 24px);
  }

  .lb-prev,
  .lb-next {
    top: auto;
    bottom: 16px;
    translate: none;
  }
}
</style>
