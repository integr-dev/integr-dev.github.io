<script setup lang="ts">
import type { NuxtError } from '#app'
import { theme } from '~/themes/active'
import { withLocale } from '~/deck/paths'

// Shown for unknown URLs (GitHub Pages serves the generated 404.html) and for errors while rendering.
const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
const { t, locale } = useI18n()
const links = computed(() => [
  { to: withLocale('/', locale.value), label: t('error.home') },
  { to: withLocale('/projects', locale.value), label: t('sheets.projects') },
  { to: withLocale('/posts', locale.value), label: t('sheets.posts') },
  { to: withLocale('/contact', locale.value), label: t('sheets.contact') },
])

usePageBuild(500)

useSeoMeta({
  title: `${notFound.value ? t('error.notFoundTitle') : t('error.errorTitle')} · Erik Reitbauer`,
  robots: 'noindex',
})
</script>

<template>
  <div class="error-page">
    <component :is="theme.ThemeBackground" :x="0" :total="1" />
    <component :is="theme.BuildOverlay" v-if="theme.BuildOverlay" />
    <main class="error" data-build-root>
      <p class="error-code" data-build="type">{{ error.statusCode }}</p>
      <h1 data-build="type">{{ notFound ? t('error.notFound') : t('error.failed') }}</h1>
      <span class="rule" data-build="line" />
      <p class="error-text" data-build="print">
        {{ notFound ? t('error.notFoundText') : error.statusMessage }}
      </p>
      <p class="error-links mono" data-build="chips">
        <a v-for="l in links" :key="l.to" :href="l.to">{{ l.label }}</a>
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
  font-family: var(--font-pixel);
  font-weight: var(--font-pixel-weight);
  font-synthesis: none;
  font-size: clamp(4rem, 14vw, 8rem);
  line-height: 1;
  color: var(--line);
}

h1 {
  font-family: var(--font-pixel);
  font-weight: var(--font-pixel-weight);
  font-synthesis: none;
  letter-spacing: 0;
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
