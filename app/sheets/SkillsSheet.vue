<script setup lang="ts">
import { slugify } from '~/deck/useSearch'
import { fallbackIcon, skillIcons } from './skillIcons'
import type { SkillIcon } from './skillIcons'

const { skills } = await useSiteContent()
const { t } = useI18n()
const icon = (name: string): SkillIcon => skillIcons[name] ?? fallbackIcon

// A click (or Enter / Space) opens a skill: what it is, a rating from 0 to 5 and why. One at a
// time: opening another closes the open one, clicking it again closes it.
const open = ref<string | null>(null)

function toggle(name: string) {
  open.value = open.value === name ? null : name
}

// An opened skill pushes the ones below it down. What runs past the bottom of its column fades out
// into it (data-overflow); an opened skill itself never does: its list moves up (--shift) until it
// fits, the skills above fading out at the top instead (data-shifted), and moves back when it closes.
const FADE = 72
const lists = ref<HTMLElement[]>([])
const overflowing = ref<boolean[]>([])
const shifts = ref<number[]>([])

/**
 * Where each list has to be once the open skill has unfolded, worked out before it does (from the
 * folded rows and the unfolded text's height), so the list moves up while the row unfolds and the
 * fades are there from the start.
 */
function fit() {
  lists.value.forEach((ul, i) => {
    const rows = [...ul.children] as HTMLElement[]
    const folded = (li: HTMLElement) => li.querySelector<HTMLElement>('.s-row')?.offsetHeight ?? 0
    const total = rows.reduce((sum, li) => sum + folded(li), 0)
    const at = rows.findIndex(li => li.hasAttribute('data-open'))
    let shift = 0
    let extra = 0
    if (at >= 0) {
      const li = rows[at]!
      extra = li.querySelector<HTMLElement>('.s-more-inner')?.scrollHeight ?? 0
      const top = rows.slice(0, at).reduce((sum, r) => sum + folded(r), 0)
      const bottom = top + folded(li) + extra
      // no further than the unfolded part, so the clicked row stays under the pointer
      shift = Math.max(0, Math.min(top, extra, bottom + FADE - ul.clientHeight))
    }
    shifts.value[i] = shift
    overflowing.value[i] = total + extra - shift > ul.clientHeight + 1
  })
}
watch(open, () => nextTick(fit))
onMounted(() => {
  fit()
  window.addEventListener('resize', fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))
</script>

<template>
  <div class="sheet skills">
    <h2 data-build="type">{{ $t('sheets.skills') }}</h2>
    <p class="s-hint mono muted" data-build="fade" data-nopen>
      <span class="s-hint-click"><kbd>{{ t('skills.clickKey') }}</kbd> {{ t('skills.clickHint') }}</span>
      <span class="s-hint-tap"><kbd>{{ t('skills.tapKey') }}</kbd> {{ t('skills.tapHint') }}</span>
    </p>
    <span class="rule rule-strong" data-build="line" />

    <div class="s-cols" :style="{ '--n': skills.length }">
      <!-- keyed by position: the category names change with the language, and a new column would
           not be drawn (it stays hidden) -->
      <section
        v-for="(c, i) in skills"
        :key="i"
        class="s-col"
        :data-overflow="overflowing[i] ? '' : undefined"
        :data-shifted="shifts[i] ? '' : undefined"
        :style="{ '--shift': `${shifts[i] ?? 0}px` }"
      >
        <span v-if="i" class="s-sep" data-build="vline" aria-hidden="true" />
        <h3 class="mono" data-build="type">{{ c.category }}</h3>
        <ul ref="lists" data-build="chips">
          <li
            v-for="item in c.items"
            :id="`skill-${slugify(item.name)}`"
            :key="item.name"
            tabindex="0"
            :data-open="open === item.name ? '' : undefined"
            :aria-expanded="open === item.name"
            @click="toggle(item.name)"
            @keydown.enter.prevent="toggle(item.name)"
            @keydown.space.prevent="toggle(item.name)"
            @keydown.esc="open = null"
          >
            <span class="s-row">
              <!-- a slot on every row, so the icons stay in line; a star in it for my favourites -->
              <span class="s-fav" :title="item.favorite ? t('skills.favorite') : undefined">
                <svg v-if="item.favorite" viewBox="0 0 24 24" role="img" :aria-label="t('skills.favorite')">
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
                </svg>
              </span>
              <span class="s-icon" aria-hidden="true">
                <Icon v-if="'fa' in icon(item.name)" :icon="(icon(item.name) as { fa: [string, string] }).fa" />
                <svg v-else viewBox="0 0 24 24"><path :d="(icon(item.name) as { path: string }).path" /></svg>
              </span>
              {{ item.name }}
            </span>
            <!-- the row unfolds downwards: what it is, how much I like it, and why -->
            <span class="s-more">
              <span class="s-more-inner">
                <span class="s-what">{{ item.what }}</span>
                <!-- not class "on": the builder clears that class inside lists when it redraws -->
                <span v-if="item.rating != null" class="s-stars" role="img" :aria-label="t('skills.rating', { n: item.rating })">
                  <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" :class="{ lit: n <= item.rating }" aria-hidden="true">
                    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
                  </svg>
                </span>
                <span v-if="item.why" class="s-why">{{ item.why }}</span>
              </span>
            </span>
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
  font-size: clamp(2.2rem, calc(var(--vw) * 5), 4rem);
}

/* how to open a skill, as a subheading: click with a mouse, tap on touch screens */
.s-hint {
  margin-top: -14px;
  font-size: 0.8rem;
}

.s-hint-tap {
  display: none;
}

@media (hover: none) {
  .s-hint-click {
    display: none;
  }

  .s-hint-tap {
    display: inline;
  }
}

kbd {
  font: inherit;
  color: var(--accent);
  border: 1px solid var(--line-strong);
  padding: 0 5px;
  margin-right: 6px;
}

/* one ruled column per category, as tall as the space left on the sheet */
.s-cols {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.s-col {
  /* the gap to the rules on either side; the column itself runs from rule to rule, so an opened
     skill's lines and background can too */
  --px: clamp(16px, calc(var(--vw) * 2.4), 36px);
  --pl: var(--px);

  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 4px;
}

.s-col:first-child {
  --pl: 0px;
}

.s-sep {
  position: absolute;
  /* above an opened skill's background */
  z-index: 1;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--line);
  opacity: 0.6;
}

h3 {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--line);
  margin-bottom: 10px;
  padding: 0 var(--px) 0 var(--pl);
}

ul {
  list-style: none;
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* pushed past the bottom of the column the list fades into it; moved up, it fades at the top too */
ul {
  --fade-top: 0px;
  --fade-bottom: 0px;

  mask-image: linear-gradient(to bottom, transparent, #000 var(--fade-top), #000 calc(100% - var(--fade-bottom)), transparent);
}

.s-col[data-overflow] ul {
  --fade-bottom: 72px;
}

.s-col[data-shifted] ul {
  --fade-top: 40px;
}

li {
  position: relative;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  /* moved up together with the unfolding (see fit) */
  transform: translateY(calc(-1 * var(--shift, 0px)));
  transition: transform 260ms ease;
}

.s-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px var(--px) 5px var(--pl);
}




/* the opened row: name and icon in the accent colour, on a solid background */
li[data-open] .s-row,
li:focus-visible .s-row {
  color: var(--accent);
}

li[data-open] .s-icon,
li:focus-visible .s-icon {
  color: var(--accent);
}

/* on hover it turns the accent colour, so it reads as clickable */
@media (hover: hover) {
  li:hover .s-row,
  li:hover .s-icon {
    color: var(--accent);
  }
}

.s-fav {
  flex: 0 0 12px;
  height: 12px;
  margin-right: -4px;
  display: grid;
  place-items: center;
}

.s-fav svg {
  width: 12px;
  height: 12px;
  fill: var(--accent);
}

.s-icon {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  color: var(--fg-muted);
  transition: color 150ms ease;
}

.s-icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* unfolding: the row grows from nothing to its full height, pushing the skills below down */
.s-more {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 260ms ease;
}

li[data-open] .s-more {
  grid-template-rows: 1fr;
}

.s-more-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
  /* past the star slot, in line with the icon */
  padding: 0 var(--px) 0 calc(var(--pl) + 20px);
  font-size: 0.88rem;
  line-height: 1.5;
}

.s-what {
  color: var(--fg-muted);
}

.s-stars {
  display: flex;
  gap: 3px;
}

.s-stars svg {
  width: 15px;
  height: 15px;
  fill: color-mix(in srgb, var(--fg-muted) 45%, transparent);
}

.s-stars svg.lit {
  fill: var(--accent);
}

.s-why {
  padding-bottom: 16px;
  color: var(--fg);
}

@media (max-width: 767px) {
  .s-cols {
    grid-template-columns: 1fr;
    gap: 28px 0;
  }

  .s-col {
    --px: 0px;
    --pl: 0px;
  }

  .s-sep {
    display: none;
  }

  ul {
    overflow: visible;
    mask-image: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .s-more,
  li {
    transition: none;
  }
}
</style>
