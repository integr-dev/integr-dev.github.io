<script setup lang="ts">
import PixelAvatar from './PixelAvatar.vue'

const { profile } = await useSiteContent()

// Render the build-time age, then refresh it in the browser so a static build never goes stale.
const age = useState('intro-age', () => (profile.value ? ageFrom(profile.value.birth) : null))

const flipped = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (profile.value) age.value = ageFrom(profile.value.birth)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // start flipping once the name has been typed
  window.addEventListener('deck:built', startFlip, { once: true })
})
function startFlip() {
  timer = setInterval(() => (flipped.value = !flipped.value), 2600)
}
onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('deck:built', startFlip)
})
</script>

<template>
  <div v-if="profile" class="sheet intro">
    <div class="intro-text">
      <figure class="intro-figure">
        <PixelAvatar />
        <figcaption class="mono muted" data-build="type">184 × 184 px, 1:1</figcaption>
      </figure>

      <h1 class="intro-name">
        <span class="sr-only">{{ profile.fullName }}, also known as {{ profile.handle }}</span>
        <span class="flip" :class="{ 'is-flipped': flipped }" aria-hidden="true">
          <span class="flip-a" data-build="type">{{ profile.handle }}</span>
          <span class="flip-b">{{ profile.name }}</span>
        </span>
      </h1>
      <span class="rule" data-build="line" />
      <p class="intro-facts" data-build="type">
        {{ profile.fullName }}, {{ age }}, {{ profile.role.toLowerCase() }} from {{ profile.location }}.
      </p>
      <p class="intro-pitch" data-build="print">
        {{ profile.pitch }}
      </p>
      <p class="intro-looking" data-build="type">
        {{ profile.lookingFor }}
      </p>
      <p class="intro-hint mono muted" data-build="fade" data-nopen>
        <span><kbd>→</kbd> projects</span>
        <span><kbd>/</kbd> search</span>
        <span><kbd>click</kbd> skip the drawing</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  align-items: center;
}

.intro-text {
  max-width: 760px;
}

.intro-figure {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 40px;
}

figcaption {
  font-size: 0.72rem;
}

.intro-name {
  font-size: clamp(3.5rem, 10vw, 8.5rem);
  line-height: 1;
  height: 1.2em;
  overflow: clip;
}

.flip {
  display: grid;
  transition: transform 600ms var(--transition-ease);
}

.flip > span {
  grid-area: 1 / 1;
  line-height: 1.2;
}

.flip-b {
  transform: translateY(100%);
}

.flip.is-flipped {
  transform: translateY(-100%);
}

.rule {
  width: min(420px, 100%);
  margin: 28px 0 24px;
}

.intro-facts {
  font-size: 1.35rem;
  color: var(--fg);
}

.intro-pitch {
  max-width: 34ch;
  margin-top: 10px;
  font-size: 1.15rem;
  color: var(--fg-muted);
}

.intro-looking {
  margin-top: 18px;
  font-size: 1.05rem;
  color: var(--line);
}

.intro-hint {
  display: flex;
  gap: 24px;
  margin-top: 40px;
  font-size: 0.8rem;
}

kbd {
  font: inherit;
  color: var(--accent);
  border: 1px solid var(--line-strong);
  padding: 0 5px;
  margin-right: 6px;
}

@media (max-width: 767px) {
  .intro {
    min-height: 100svh;
  }

  .intro-looking {
  margin-top: 18px;
  font-size: 1.05rem;
  color: var(--line);
}

.intro-hint {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flip {
    transition: none;
  }
}
</style>
