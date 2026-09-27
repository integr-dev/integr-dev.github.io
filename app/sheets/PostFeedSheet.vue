<script setup lang="ts">
const { posts } = await useSiteContent()
</script>

<template>
  <div class="sheet feed">
    <header class="p-head">
      <h2 data-build="type">Posts</h2>
      <span class="rule" data-build="line" />
    </header>

    <ol v-if="posts.length" class="p-list">
      <li v-for="p in posts" :key="p.path" class="p-item">
        <time class="mono muted" :datetime="p.date" data-build="type">{{ formatDate(p.date) }}</time>
        <div>
          <h3 data-build="type"><NuxtLink :to="p.path">{{ p.title }}</NuxtLink></h3>
          <p class="p-summary" data-build="print">{{ p.summary }}</p>
          <p v-if="p.tags?.length" class="p-tags mono muted" data-build="fade">{{ p.tags.join(', ') }}</p>
        </div>
      </li>
    </ol>
    <p v-else class="muted" data-build="type">Nothing here yet.</p>
  </div>
</template>

<style scoped>
.feed {
  height: auto;
  min-height: 100%;
  max-width: 920px;
  padding-bottom: 180px;
}

.p-head h2 {
  font-size: clamp(2.2rem, 5vw, 4rem);
}

.p-head .rule {
  margin: 20px 0 8px;
}

.p-list {
  list-style: none;
  padding: 0;
}

.p-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 24px;
  padding: 24px 0;
}

.p-item time {
  font-size: 0.78rem;
  padding-top: 6px;
}

.p-item h3 {
  font-size: 1.5rem;
}

.p-item h3 a {
  color: var(--fg);
  text-decoration: none;
}

.p-item h3 a:hover {
  color: var(--line);
}

.p-summary {
  margin-top: 6px;
  max-width: 60ch;
  color: var(--fg-muted);
}

.p-tags {
  margin-top: 8px;
  font-size: 0.75rem;
}

@media (max-width: 767px) {
  .p-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
