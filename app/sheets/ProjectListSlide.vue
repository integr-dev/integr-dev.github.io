<script setup lang="ts">
const props = defineProps<{ tier: 'featured' | 'more', sheetId: string }>()
const { byTier } = await useSiteContent()
const items = computed(() => byTier(props.tier))

const slug = (stem: string) => stem.split('/').pop()!
</script>

<template>
  <div class="sheet register" :class="`tier-${tier}`">
    <header class="r-head">
      <h2 data-build="type">{{ tier === 'featured' ? 'Other projects' : 'More' }}</h2>
      <p v-if="tier === 'more'" class="muted" data-build="print">Libraries and older experiments.</p>
    </header>

    <span class="rule rule-strong" data-build="line" />

    <div class="r-cols" :style="{ '--n': items.length }" role="list">
      <div v-for="(p, i) in items" :key="p.stem" class="r-col" role="listitem">
        <span v-if="i" class="r-sep" data-build="vline" aria-hidden="true" />
        <h3 :id="`project-${slug(p.stem)}`" data-build="type">{{ p.title }}</h3>
        <p class="r-tagline" data-build="print">{{ p.tagline }}</p>
        <div v-if="p.body?.value?.length" class="r-body muted" data-build="print">
          <ContentRenderer :value="p" />
        </div>
        <div class="r-foot">
          <ul class="r-stack" data-build="chips">
            <li v-for="s in p.stack" :key="s" class="chip">{{ s }}</li>
          </ul>
          <p class="r-links" data-build="chips">
            <a v-for="l in p.links" :key="l.href" :href="l.href" target="_blank" rel="noopener">
              {{ l.label }} <FontAwesomeIcon icon="arrow-up-right-from-square" class="ext" />
            </a>
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.register {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.r-head h2 {
  font-size: clamp(2.2rem, 5vw, 4rem);
}

.r-head p {
  margin-top: 8px;
}

/* one column per project, divided by ruled lines */
.r-cols {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.r-col {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px clamp(20px, 3vw, 44px) 0;
}

.r-col:first-child {
  padding-left: 0;
}

.r-sep {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--line);
  opacity: 0.6;
}

.r-col h3 {
  font-size: clamp(1.6rem, 2.6vw, 2.4rem);
  width: fit-content;
}

.r-tagline {
  font-size: 1.1rem;
  color: var(--fg);
}

.r-body {
  font-size: 0.92rem;
}

/* stack and links line up at the bottom of every column */
.r-foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.r-stack {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.r-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
}

.ext {
  font-size: 0.7em;
  margin-left: 2px;
}

@media (max-width: 900px) {
  .r-cols {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .r-col,
  .r-col:first-child {
    padding: 0;
  }

  .r-sep {
    display: none;
  }
}
</style>
