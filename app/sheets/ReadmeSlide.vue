<script setup lang="ts">
// The page below a flagship: the project's readme as scrollable long form text.
const props = defineProps<{ project: string, sheetId?: string }>()

const { data: readme } = await useAsyncData(`readme-${props.project}`, () =>
  queryCollection('readmes').path(`/readmes/${props.project}`).first(),
)
const { project: findProject } = await useSiteContent()
const built = computed(() => findProject(props.project)?.built)
</script>

<template>
  <div class="sheet readme">
    <header class="rd-head">
      <p class="rd-kicker mono" data-build="type">{{ $t('readme.kicker') }}</p>
      <h2 data-build="type">{{ readme?.title }}</h2>
    </header>
    <span class="rule rule-strong" data-build="line" />
    <!-- data-scroll: the deck lets wheel and arrow keys scroll this before moving on -->
    <div class="rd-scroll" data-scroll>
      <section v-if="built" class="rd-built" :aria-label="$t('readme.built')">
        <!-- the box is drawn in first: its background wipes across, then the accent bar -->
        <span class="rd-built-bg" data-build="line" aria-hidden="true" />
        <span class="rd-built-bar" data-build="vline" aria-hidden="true" />
        <p data-build="print"><strong>{{ $t('readme.problem') }}</strong> {{ built.problem }}</p>
        <p data-build="print"><strong>{{ $t('readme.solution') }}</strong> {{ built.solution }}</p>
      </section>
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

/* like a post: the kicker above the title, where a post has its date */
.rd-head {
  display: flex;
  flex-direction: column;
}

.rd-kicker {
  font-size: 0.8rem;
  color: var(--line);
}

.rd-built {
  position: relative;
  /* keeps the drawn background behind the text but in front of the sheet */
  isolation: isolate;
  display: grid;
  gap: 10px;
  margin-bottom: 28px;
  padding: 16px 20px;
  line-height: 1.6;
}

.rd-built-bg,
.rd-built-bar {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.rd-built-bg {
  background: color-mix(in srgb, var(--line) 6%, transparent);
}

.rd-built-bar {
  right: auto;
  width: 2px;
  background: var(--accent);
}

.rd-built strong {
  color: var(--accent);
  font-weight: 500;
}

.rd-head h2 {
  margin-top: 8px;
  font-size: clamp(2rem, calc(var(--vw) * 4), 3.2rem);
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
