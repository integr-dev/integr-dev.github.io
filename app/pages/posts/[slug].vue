<script setup lang="ts">
import { theme } from '~/themes/active'

const route = useRoute()
const path = `/posts/${route.params.slug}`
const { data: post } = await useAsyncData(`post-${path}`, () => queryCollection('posts').path(path).first())

if (!post.value || post.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const { profile } = await useSiteContent()
const url = `${SITE_URL}${path}`
const title = `${post.value.title} · ${profile.value?.fullName ?? 'Erik Reitbauer'}`

useSeoMeta({
  title,
  description: post.value.summary,
  author: profile.value?.fullName,
  ogType: 'article',
  ogTitle: post.value.title,
  ogDescription: post.value.summary,
  ogUrl: url,
  ogImage: OG_IMAGE,
  articlePublishedTime: post.value.date,
  articleTag: post.value.tags,
  twitterCard: 'summary_large_image',
  twitterTitle: post.value.title,
  twitterDescription: post.value.summary,
  twitterImage: OG_IMAGE,
})

useHead({
  link: [{ rel: 'canonical', href: url }],
  script: profile.value
    ? [jsonLd({
        '@type': 'BlogPosting',
        'headline': post.value.title,
        'description': post.value.summary,
        'datePublished': post.value.date,
        'url': url,
        'mainEntityOfPage': url,
        'image': OG_IMAGE,
        'keywords': post.value.tags?.join(', '),
        'author': personSchema(profile.value),
      })]
    : [],
})

const date = computed(() =>
  post.value ? formatDate(post.value.date) : '',
)
</script>

<template>
  <div class="post-page">
    <component :is="theme.ThemeBackground" :x="0" :total="1" />
    <article v-if="post" class="post">
      <NuxtLink to="/#/posts" class="post-back mono">
        <FontAwesomeIcon icon="arrow-left" /> Posts
      </NuxtLink>
      <header>
        <h1>{{ post.title }}</h1>
        <p class="post-meta mono muted">
          <time :datetime="post.date">{{ date }}</time>
          <template v-if="post.tags?.length"> / {{ post.tags.join(', ') }}</template>
        </p>
        <span class="rule" />
      </header>
      <ContentRenderer :value="post" class="post-body" />
    </article>
  </div>
</template>

<style scoped>
.post-page {
  position: relative;
  min-height: 100dvh;
}

.post {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 72px 20px 120px;
}

.post-back {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 48px;
}

h1 {
  font-size: clamp(2.2rem, 6vw, 3.6rem);
}

.post-meta {
  margin-top: 12px;
  font-size: 0.8rem;
}

.rule {
  margin: 28px 0 36px;
}

.post-body {
  font-size: 1.08rem;
  line-height: 1.7;
}

.post-body :deep(p),
.post-body :deep(ul),
.post-body :deep(ol),
.post-body :deep(pre) {
  margin: 0 0 1.1em;
}

.post-body :deep(h2) {
  font-size: 1.6rem;
  margin: 1.8em 0 0.6em;
}

.post-body :deep(pre) {
  padding: 18px 20px;
  overflow-x: auto;
  font-size: 0.88rem;
}

.post-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.post-body :deep(img) {
  border: 1px solid var(--line-strong);
}
</style>
