<script setup lang="ts">
// The page below a flagship: the project's readme as scrollable long form text.
const props = defineProps<{ project: string, sheetId?: string }>()

const { data: readme } = await useAsyncData(`readme-${props.project}`, () =>
  queryCollection('readmes').path(`/readmes/${props.project}`).first(),
)
</script>

<template>
  <div class="sheet readme">
    <header class="rd-head">
      <p class="rd-kicker mono" data-build="type">readme</p>
      <h2 data-build="type">{{ readme?.title }}</h2>
    </header>
    <span class="rule rule-strong" data-build="line" />
    <!-- data-scroll: the deck lets wheel and arrow keys scroll this before moving on -->
    <div class="rd-scroll" data-scroll>
      <div v-if="readme" class="rd-body" data-build="print">
        <ContentRenderer :value="readme" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.readme {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rd-head {
  display: flex;
  align-items: baseline;
  gap: 18px;
}

.rd-kicker {
  font-size: 0.8rem;
  color: var(--line);
}

.rd-head h2 {
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.rd-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.rd-body {
  padding-bottom: 48px;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--fg);
}

.rd-body :deep(h2) {
  font-size: 1.5rem;
  margin: 1.8em 0 0.5em;
}

.rd-body :deep(h3) {
  font-size: 1.15rem;
  margin: 1.4em 0 0.4em;
}

.rd-body :deep(p),
.rd-body :deep(ul),
.rd-body :deep(ol),
.rd-body :deep(pre),
.rd-body :deep(table) {
  margin: 0 0 1em;
}

.rd-body :deep(li) {
  margin: 0.2em 0;
}

.rd-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
}

.rd-body :deep(pre) {
  padding: 16px 18px;
  overflow-x: auto;
  font-size: 0.85rem;
}

.rd-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.rd-body :deep(th),
.rd-body :deep(td) {
  text-align: left;
  vertical-align: top;
  padding: 6px 12px 6px 0;
  border-bottom: 1px dashed var(--bg-grid-strong);
}

.rd-body :deep(th) {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--line);
}

@media (max-width: 767px) {
  .rd-scroll {
    overflow: visible;
    padding-right: 0;
  }
}
</style>
