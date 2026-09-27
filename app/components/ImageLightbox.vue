<script setup lang="ts">
// Large preview of a screenshot. ←/→ move through the screenshots of the same project,
// Esc or a click outside the image closes it.
const lightbox = useLightbox()
const closeBtn = ref<HTMLButtonElement>()

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

onMounted(() => window.addEventListener('keydown', onKey, { capture: true }))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, { capture: true }))
</script>

<template>
  <Transition name="lb">
    <div v-if="current" class="lb" role="dialog" aria-modal="true" :aria-label="current.alt" @click.self="lightbox.close()">
      <figure class="lb-frame">
        <img
          :key="current.src"
          :src="current.src"
          :alt="current.alt"
          :width="current.width"
          :height="current.height"
        >
        <figcaption class="lb-caption mono">
          <span>{{ current.alt }}</span>
          <span v-if="count > 1" class="lb-count">{{ (lightbox.state.value?.index ?? 0) + 1 }} / {{ count }}</span>
        </figcaption>
      </figure>

      <button v-if="count > 1" type="button" class="lb-btn lb-prev" aria-label="Previous screenshot" @click="lightbox.step(-1)">
        <FontAwesomeIcon icon="arrow-left" />
      </button>
      <button v-if="count > 1" type="button" class="lb-btn lb-next" aria-label="Next screenshot" @click="lightbox.step(1)">
        <FontAwesomeIcon icon="arrow-right" />
      </button>
      <button ref="closeBtn" type="button" class="lb-btn lb-close mono" aria-label="Close preview" @click="lightbox.close()">
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

.lb-frame img {
  max-width: min(1600px, calc(100vw - 176px));
  max-height: calc(100dvh - 150px);
  width: auto;
  height: auto;
  object-fit: contain;
  border: 1px solid var(--line-strong);
  background: var(--surface);
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

.lb-enter-active,
.lb-leave-active {
  transition: opacity 180ms ease;
}

.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .lb {
    padding: 64px 12px;
  }

  .lb-frame img {
    max-width: calc(100vw - 24px);
  }

  .lb-prev,
  .lb-next {
    top: auto;
    bottom: 16px;
    translate: none;
  }
}
</style>
