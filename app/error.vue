<script setup lang="ts">
import type { NuxtError } from '#app'
import { theme } from '~/themes/active'

// Shown for unknown URLs (GitHub Pages serves the generated 404.html) and for errors while rendering.
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

usePageBuild(500)

useSeoMeta({
  title: notFound.value ? 'Not found · Erik Reitbauer' : 'Error · Erik Reitbauer',
  robots: 'noindex',
})
</script>

<template>
  <div class="error-page">
    <component :is="theme.ThemeBackground" :x="0" :total="1" />
    <component :is="theme.BuildOverlay" v-if="theme.BuildOverlay" />
    <main class="error" data-build-root>
      <p class="error-code mono" data-build="type">{{ error.statusCode }}</p>
      <h1 data-build="type">{{ notFound ? 'This sheet was never drawn.' : 'Something went wrong.' }}</h1>
      <span class="rule" data-build="line" />
      <p class="error-text" data-build="print">
        {{ notFound ? 'There is nothing at this address. It may have moved, or the link has a typo.' : error.statusMessage }}
      </p>
      <p class="error-links mono" data-build="chips">
        <a href="/">Home</a>
        <a href="/projects">Projects</a>
        <a href="/posts">Posts</a>
        <a href="/contact">Contact</a>
      </p>
    </main>
  </div>
</template>

<style scoped>
.error-page {
  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
}

.error {
  position: relative;
  z-index: 1;
  max-width: 640px;
  padding: 72px 20px;
}

.error-code {
  font-size: clamp(4rem, 14vw, 8rem);
  line-height: 1;
  color: var(--line);
}

h1 {
  margin-top: 16px;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
}

.rule {
  margin: 24px 0;
}

.error-text {
  font-size: 1.08rem;
  color: var(--fg-muted);
}

.error-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 32px;
  font-size: 0.9rem;
}
</style>
