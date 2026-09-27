<script setup lang="ts">
import PixelAvatar from './PixelAvatar.vue'
import { useDeckNav } from '~/deck/useDeckNav'

const { profile } = await useSiteContent()

// Render the build-time age, then refresh it in the browser so a static build never goes stale.
const age = useState('intro-age', () => (profile.value ? ageFrom(profile.value.birth) : null))

const nav = useDeckNav()

// shortcuts from the first screen to the places people look for most
const shortcuts = [
  { label: 'Projects', sheet: 'osmium' },
  { label: 'Posts', sheet: 'posts' },
  { label: 'Contact', sheet: 'contact' },
]

// on phones the deck is one vertical scroll, so scroll there instead of switching sheets
function open(sheet: string) {
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.getElementById(`sheet-${sheet}`)?.scrollIntoView({ behavior: 'smooth' })
  }
  else nav.goTo(sheet)
}

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
      <!-- first in the markup so they are drawn first; placed top right by CSS -->
      <ul class="intro-links mono" data-build="chips" data-nopen>
        <li v-for="s in shortcuts" :key="s.sheet">
          <button type="button" @click="open(s.sheet)">
            {{ s.label }} <FontAwesomeIcon icon="arrow-right" />
          </button>
        </li>
      </ul>
      <figure class="intro-figure">
        <PixelAvatar />
        <figcaption class="mono muted" data-build="type">184 × 184 px, 1:1</figcaption>
      </figure>

      <!-- decorative handle; the page heading (h1) is the full name line below, visible text for search engines -->
      <div class="intro-name" aria-hidden="true">
        <span class="flip" :class="{ 'is-flipped': flipped }">
          <span class="flip-a" data-build="type">{{ profile.handle }}</span>
          <span class="flip-b">{{ profile.name.toLowerCase() }}</span>
        </span>
      </div>
      <span class="rule" data-build="line" />
      <h1 class="intro-facts" data-build="type">
        {{ profile.fullName }}, {{ age }}, {{ profile.role.toLowerCase() }} from {{ profile.location }}.
      </h1>
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
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
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
  /* an h1 for search engines, styled like body text */
  font-family: var(--font-body);
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1.55;
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

.intro-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  /* top right corner of the sheet, inside the frame */
  position: absolute;
  top: calc(var(--frame-gap) + var(--pad));
  right: calc(var(--frame-gap) + var(--pad));
}

.intro-links button {
  font: inherit;
  font-size: 0.9rem;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 8px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.intro-links button:hover {
  border-color: var(--accent);
  color: var(--accent);
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
  /* on phones the shortcuts sit below the text again */
  .intro-text {
    display: flex;
    flex-direction: column;
  }

  .intro-links {
    position: static;
    order: 1;
    margin-top: 28px;
  }

  /* the image size note and keyboard hints mean nothing on a phone */
  .intro-figure figcaption,
  .intro-hint {
    display: none;
  }

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
