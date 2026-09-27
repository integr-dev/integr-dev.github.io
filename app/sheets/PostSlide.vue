<script setup lang="ts">
import { useDeckNav } from '~/deck/useDeckNav'

// One post as a page below the post list: drawn like the other sheets, the text scrolls inside.
const props = defineProps<{ path: string, sheetId?: string }>()
const nav = useDeckNav()

/** Straight back to the list, however many posts down this one is. */
function backToList() {
  // on phones this also folds the post away again; scroll once it is gone
  if (window.matchMedia('(max-width: 767px)').matches) {
    watch(nav.slideId, () => document.getElementById('slide-posts-list')?.scrollIntoView({ behavior: 'smooth' }), { once: true, flush: 'post' })
  }
  nav.goTo('posts', 'list')
}

const { data: post } = await useAsyncData(`post-slide-${props.path}`, () =>
  queryCollection('posts').path(props.path).first(),
)

const slug = props.path.split('/').pop()!
</script>

<template>
  <article v-if="post" class="sheet post-slide">
    <header class="ps-head">
      <button type="button" class="ps-back mono" data-build="fade" @click="backToList">
        <FontAwesomeIcon icon="arrow-up" /> All posts
      </button>
      <p class="ps-meta mono" data-build="type">
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <template v-if="post.tags?.length"> / {{ post.tags.join(', ') }}</template>
      </p>
      <h2 :id="`post-${slug}`" data-build="type">{{ post.title }}</h2>
    </header>
    <span class="rule rule-strong" data-build="line" />
    <!-- data-scroll: the deck lets wheel and arrow keys scroll this before moving on -->
    <div class="ps-scroll" data-scroll>
      <div class="ps-body" data-build="print">
        <ContentRenderer :value="post" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.post-slide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ps-back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  font: inherit;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 6px 12px;
  cursor: pointer;
}

.ps-back:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.ps-head {
  display: flex;
  flex-direction: column;
}

.ps-meta {
  font-size: 0.8rem;
  color: var(--line);
}

.ps-head h2 {
  margin-top: 8px;
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.ps-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.ps-body {
  max-width: 76ch;
  padding-bottom: 48px;
  font-size: 1.05rem;
  line-height: 1.7;
}

.ps-body :deep(h2) {
  font-size: 1.5rem;
  margin: 1.8em 0 0.5em;
}

.ps-body :deep(p),
.ps-body :deep(ul),
.ps-body :deep(ol),
.ps-body :deep(pre) {
  margin: 0 0 1em;
}

.ps-body :deep(li) {
  margin: 0.2em 0;
}

.ps-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.ps-body :deep(pre) {
  padding: 16px 18px;
  overflow-x: auto;
  font-size: 0.88rem;
}


@media (max-width: 767px) {
  .ps-scroll {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
