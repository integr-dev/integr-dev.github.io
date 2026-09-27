<script setup lang="ts">
import { slugify } from '~/deck/useSearch'
import { fallbackIcon, skillIcons } from './skillIcons'
import type { SkillIcon } from './skillIcons'

const { skills } = await useSiteContent()
const icon = (name: string): SkillIcon => skillIcons[name] ?? fallbackIcon
</script>

<template>
  <div class="sheet skills">
    <h2 data-build="type">Skills</h2>
    <span class="rule rule-strong" data-build="line" />

    <div class="s-cols" :style="{ '--n': skills.length }">
      <section v-for="(c, i) in skills" :key="c.category" class="s-col">
        <span v-if="i" class="s-sep" data-build="vline" aria-hidden="true" />
        <h3 class="mono" data-build="type">{{ c.category }}</h3>
        <ul data-build="chips">
          <li v-for="item in c.items" :id="`skill-${slugify(item)}`" :key="item">
            <span class="s-icon" aria-hidden="true">
              <FontAwesomeIcon v-if="'fa' in icon(item)" :icon="(icon(item) as { fa: [string, string] }).fa" />
              <svg v-else viewBox="0 0 24 24"><path :d="(icon(item) as { path: string }).path" /></svg>
            </span>
            {{ item }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.skills {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skills h2 {
  font-size: clamp(2.2rem, 5vw, 4rem);
}

/* one ruled column per category */
.s-cols {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.s-col {
  position: relative;
  padding: 4px clamp(16px, 2.4vw, 36px) 0;
}

.s-col:first-child {
  padding-left: 0;
}

.s-sep {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--line);
  opacity: 0.6;
}

h3 {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--line);
  margin-bottom: 14px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  font-size: 1.05rem;
}

.s-icon {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  color: var(--fg-muted);
}

.s-icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

@media (max-width: 1000px) {
  .s-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 0;
  }

  .s-col:nth-child(odd) {
    padding-left: 0;
  }

  .s-col:nth-child(odd) .s-sep {
    display: none;
  }
}

@media (max-width: 767px) {
  .s-cols {
    grid-template-columns: 1fr;
  }

  .s-col {
    padding: 0;
  }

  .s-sep {
    display: none;
  }
}
</style>
