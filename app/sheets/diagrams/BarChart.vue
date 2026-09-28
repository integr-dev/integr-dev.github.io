<script setup lang="ts">
const props = defineProps<{
  chart: { title: string, note?: string, source?: string, bars: { label: string, value: number }[] }
}>()

const max = computed(() => Math.max(...props.chart.bars.map(b => b.value), 1))
</script>

<template>
  <figure class="chart">
    <figcaption>
      <span class="c-title" data-build="type">{{ chart.title }}</span>
    </figcaption>

    <div class="c-plot" data-build="fade" role="img" :aria-label="`${chart.title}: ${chart.bars.map(b => `${b.label} ${b.value}`).join(', ')}`">
      <div v-for="b in chart.bars" :key="b.label" class="c-col">
        <span class="c-value mono" data-build="count">{{ b.value }}</span>
        <span class="c-bar" :style="{ height: `${(b.value / max) * 100}%` }" data-build="vline" />
      </div>
    </div>
    <span class="c-axis" data-build="line" />
    <div class="c-labels mono" aria-hidden="true" data-nopen>
      <span v-for="b in chart.bars" :key="b.label" data-build="fade">{{ b.label }}</span>
    </div>

    <p v-if="chart.note" class="c-note muted" data-build="print">
      {{ chart.note }}
      <a v-if="chart.source" :href="chart.source" target="_blank" rel="noopener">{{ $t('chart.source') }}</a>
    </p>
  </figure>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
}

.c-title {
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--line);
}

.c-plot {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 8px;
  height: clamp(160px, calc(var(--vh) * 30), 280px);
  margin-top: 16px;
}

.c-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  min-height: 0;
}

.c-value {
  font-size: 0.72rem;
  color: var(--fg-muted);
}

.c-bar {
  display: block;
  width: 100%;
  background: color-mix(in srgb, var(--line) 30%, transparent);
  border: 1px solid var(--line);
  border-bottom: 0;
  transform-origin: bottom;
}

.c-col:hover .c-bar {
  background: var(--accent-wash);
  border-color: var(--accent);
}

.c-col:hover .c-value {
  color: var(--fg);
}

.c-axis {
  display: block;
  height: 1px;
  background: var(--line-strong);
}

.c-labels {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 8px;
  margin-top: 6px;
  font-size: 0.66rem;
  color: var(--fg-muted);
  text-align: center;
}

.c-note {
  margin-top: 14px;
  font-size: 0.85rem;
}
</style>
