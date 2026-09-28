<script setup lang="ts">
// Forkcast's architecture: a static Nuxt frontend talks to an Express backend over REST, the
// backend keeps everything in SQLite, fetches recipes from Spoonacular and sends the account
// emails. Facts from the repository README.

const { t } = useI18n()
const d = (key: string) => t(`diagram.forkcast.${key}`)

const frontendParts = ['planner', 'shopping', 'discover', 'friends']
const backendModules = [
  [{ t: 'auth' }, { t: 'plans' }, { t: 'friends' }, { t: 'favorites' }],
  [{ t: 'cache', accent: true }, { t: 'email' }],
]
</script>

<template>
  <figure class="diagram">
    <svg viewBox="0 0 560 460" role="img" :aria-label="d('aria')">
      <!-- frontend -->
      <rect class="box strong" x="8" y="8" width="400" height="92" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="32" data-build="fade">{{ d('frontend') }}</text>
      <text class="note" x="394" y="32" text-anchor="end" data-build="fade">{{ d('hosting') }}</text>
      <text class="note" x="22" y="52" data-build="fade">{{ d('frontendStack') }}</text>
      <g data-build="fade">
        <g v-for="(part, i) in frontendParts" :key="part">
          <rect class="cell" :x="22 + i * 94" y="64" width="88" height="24" />
          <text class="cell-text" :x="66 + i * 94" y="80" text-anchor="middle">{{ d(part) }}</text>
        </g>
      </g>

      <!-- frontend ↔ backend -->
      <path class="wire" d="M208,100 V150" pathLength="1" data-build="path" />
      <path class="head" d="M203,144 L208,150 L213,144" pathLength="1" data-build="path" />
      <path class="flow down" d="M208,100 V150" data-build="fade" />
      <text class="note" x="218" y="129" data-build="fade">{{ d('rest') }}</text>

      <!-- backend -->
      <rect class="box strong" x="8" y="150" width="400" height="150" pathLength="1" data-build="path" data-pen />
      <text class="label" x="22" y="174" data-build="fade">{{ d('backend') }}</text>
      <text class="note" x="394" y="174" text-anchor="end" data-build="fade">{{ d('image') }}</text>
      <text class="note" x="22" y="194" data-build="fade">Express 5 · better-sqlite3 · JWT</text>
      <g data-build="fade">
        <template v-for="(row, r) in backendModules" :key="r">
          <g v-for="(m, i) in row" :key="m.t">
            <rect class="cell" :class="{ accent: m.accent }" :x="22 + i * 94" :y="208 + r * 36" width="88" height="26" />
            <text class="cell-text" :x="66 + i * 94" :y="225 + r * 36" text-anchor="middle">{{ d(m.t) }}</text>
          </g>
        </template>
      </g>

      <!-- database -->
      <path class="wire" d="M408,225 H440" pathLength="1" data-build="path" />
      <g class="db" data-build="fade" data-pen>
        <path d="M440,190 v70 a56,12 0 0 0 112,0 v-70" />
        <ellipse cx="496" cy="190" rx="56" ry="12" />
        <text class="label" x="496" y="228" text-anchor="middle">SQLite</text>
        <text class="note" x="496" y="246" text-anchor="middle">better-sqlite3</text>
      </g>

      <!-- backend → Spoonacular, backend → email -->
      <path class="wire" d="M66,300 V360" pathLength="1" data-build="path" />
      <path class="head" d="M61,354 L66,360 L71,354" pathLength="1" data-build="path" />
      <path class="flow down" d="M66,300 V360" data-build="fade" />
      <text class="note" x="76" y="334" data-build="fade">{{ d('recipes') }}</text>

      <path class="wire" d="M348,300 V360" pathLength="1" data-build="path" />
      <path class="head" d="M343,354 L348,360 L353,354" pathLength="1" data-build="path" />
      <path class="flow down" d="M348,300 V360" data-build="fade" />
      <text class="note" x="358" y="334" data-build="fade">{{ d('accountMails') }}</text>

      <rect class="box" x="8" y="360" width="260" height="92" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="22" y="384">Spoonacular API</text>
        <text class="note" x="22" y="404">{{ d('spoonacular') }}</text>
        <text class="note" x="22" y="424">{{ d('search') }}</text>
      </g>

      <rect class="box" x="292" y="360" width="260" height="92" pathLength="1" data-build="path" data-pen />
      <g data-build="fade">
        <text class="label" x="306" y="384">{{ d('email') }}</text>
        <text class="note" x="306" y="404">{{ d('verification') }}</text>
        <text class="note" x="306" y="424">{{ d('reset') }}</text>
      </g>
    </svg>
  </figure>
</template>

<style scoped src="./diagram.css"></style>
