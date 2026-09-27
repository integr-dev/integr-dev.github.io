<script setup lang="ts">
import { useDeckNav } from '~/deck/useDeckNav'

// The post list. Each post opens as its own page below this one.
defineProps<{ sheetId?: string }>()
const { posts } = await useSiteContent()
const nav = useDeckNav()

const slug = (path: string) => path.split('/').pop()!

// on phones the deck is one vertical scroll, so scroll there instead of switching pages
function open(path: string) {
  const id = slug(path)
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.getElementById(`slide-posts-${id}`)?.scrollIntoView({ behavior: 'smooth' })
  }
  else nav.goTo('posts', id)
}
</script>

<template>
  <div class="sheet feed">
    <header class="p-head">
      <div class="p-title">
        <h2 data-build="type">Posts</h2>
        <a class="p-rss mono" href="/feed.xml" data-build="fade" data-nopen><FontAwesomeIcon icon="rss" /> RSS</a>
      </div>
      <span class="rule" data-build="line" />
    </header>

    <!-- data-scroll: a long list scrolls inside the page before the deck moves on -->
    <ol v-if="posts.length" class="p-list" data-scroll>
      <li v-for="p in posts" :key="p.path" class="p-item">
        <time class="mono muted" :datetime="p.date" data-build="type">{{ formatDate(p.date) }}</time>
        <div class="p-main">
          <h3 data-build="type">
            <a :href="`/posts/${slug(p.path)}`" @click.prevent="open(p.path)">{{ p.title }}</a>
          </h3>
          <p class="p-summary" data-build="print">{{ p.summary }}</p>
          <p v-if="p.tags?.length" class="p-tags mono muted" data-build="fade">{{ p.tags.join(', ') }}</p>
        </div>
        <p class="p-read mono" data-build="fade" data-nopen>
          <a :href="`/posts/${slug(p.path)}`" @click.prevent="open(p.path)">
            read <FontAwesomeIcon icon="arrow-down" />
          </a>
        </p>
      </li>
    </ol>
    <p v-else class="muted" data-build="type">Nothing here yet.</p>
  </div>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
}

.p-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
}

.p-rss {
  font-size: 0.8rem;
  white-space: nowrap;
}

.p-head h2 {
  font-size: clamp(2.2rem, 5vw, 4rem);
}

.p-head .rule {
  margin: 20px 0 8px;
}

.p-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  padding: 0 24px 0 0;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

/* date | title and summary (all the width there is) | read */
.p-item {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) auto;
  gap: 8px 32px;
  padding: 24px 0;
  align-items: baseline;
}

.p-item time {
  font-size: 0.78rem;
}

.p-item h3 {
  font-size: clamp(1.4rem, 2.4vw, 2rem);
}

.p-item h3 a {
  color: var(--fg);
  text-decoration: none;
}

.p-item h3 a:hover {
  color: var(--line);
}

.p-summary {
  margin-top: 8px;
  max-width: 80ch;
  color: var(--fg-muted);
}

.p-tags {
  margin-top: 8px;
  font-size: 0.75rem;
}

.p-read {
  font-size: 0.85rem;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .p-list {
    overflow: visible;
    padding: 0;
  }

  .p-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
