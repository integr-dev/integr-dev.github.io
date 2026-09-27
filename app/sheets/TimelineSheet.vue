<script setup lang="ts">
const { timeline } = await useSiteContent()
</script>

<template>
  <div class="sheet timeline">
    <h2 data-build="type">Timeline</h2>

    <div class="t-track">
      <span class="t-axis rule" data-build="line" />
      <ol class="t-entries" :style="{ '--n': timeline.length }">
        <li
          v-for="(t, i) in timeline"
          :id="`tl-${i}`"
          :key="i"
          class="t-entry"
          :class="i % 2 ? 'below' : 'above'"
        >
          <span class="t-stem" data-build="vline" />
          <div class="t-card">
            <time class="mono" data-build="type">{{ t.when }}</time>
            <h3 data-build="type">{{ t.title }}</h3>
            <p v-if="t.detail" class="muted" data-build="print">{{ t.detail }}</p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline h2 {
  font-size: clamp(2.2rem, 5vw, 4rem);
}

.t-track {
  position: relative;
  flex: 1;
  min-height: 0;
}

.t-axis {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
}

.t-entries {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  height: 100%;
}

.t-entry {
  position: relative;
  display: grid;
  grid-template-rows: 1fr 1fr;
  padding-right: 16px;
}

.t-stem {
  position: absolute;
  left: 0;
  width: 1px;
  height: 28px;
  background: var(--line);
}

.above .t-stem {
  bottom: 50%;
  transform-origin: bottom;
}

.below .t-stem {
  top: 50%;
}

.t-stem::after {
  content: '';
  position: absolute;
  left: -3px;
  width: 7px;
  height: 7px;
  background: var(--bg);
  border: 1px solid var(--line);
}

.above .t-stem::after { bottom: -4px; }
.below .t-stem::after { top: -4px; }

.t-card {
  padding-left: 12px;
}

.above .t-card {
  grid-row: 1;
  align-self: end;
  padding-bottom: 40px;
}

.below .t-card {
  grid-row: 2;
  align-self: start;
  padding-top: 40px;
}

.t-card time {
  font-size: 0.75rem;
  color: var(--line);
}

.t-card h3 {
  font-size: 1.05rem;
  margin: 4px 0;
  line-height: 1.2;
}

.t-card p {
  font-size: 0.85rem;
}

@media (max-width: 767px) {
  .t-axis {
    display: none;
  }

  .t-entries {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-left: 1px solid var(--line);
  }

  .t-entry {
    display: block;
    padding: 0 0 0 16px;
  }

  .t-stem {
    display: none;
  }

  /* phones: when and what, without the details */
  .t-card p {
    display: none;
  }

  .above .t-card,
  .below .t-card {
    padding: 0;
  }
}
</style>
