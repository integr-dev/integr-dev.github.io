export interface LightboxImage {
  src: string
  alt: string
  width?: number
  height?: number
}

/** Shared state for the screenshot preview (ImageLightbox.vue). */
export function useLightbox() {
  const state = useState<{ images: LightboxImage[], index: number } | null>('lightbox', () => null)

  return {
    state,
    isOpen: computed(() => state.value !== null),
    open(images: LightboxImage[], index = 0) {
      state.value = { images, index }
    },
    close() {
      state.value = null
    },
    step(delta: number) {
      if (!state.value) return
      const n = state.value.images.length
      state.value = { ...state.value, index: (state.value.index + delta + n) % n }
    },
  }
}
