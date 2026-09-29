<script setup lang="ts">
import buildInfo from '#build/build-info.mjs'

const { profile } = await useSiteContent()
// when the site was last built (every day at the latest, see modules/live-stats.ts)
const updated = buildInfo.builtAt.slice(0, 10)

const iconFor = (name: string) => (name === 'github' ? ['fab', 'github'] : ['fas', name])
</script>

<template>
  <div v-if="profile" class="sheet contact">
    <div class="c-main">
      <h2 data-build="type">{{ $t('sheets.contact') }}</h2>
      <p class="c-lead" data-build="print">{{ $t('contact.lead') }}</p>
      <div class="c-mail">
        <a class="c-address" :href="`mailto:${profile.email}`" data-build="type">{{ profile.email }}</a>
      </div>
      <span class="rule" data-build="line" />
      <ul class="c-links" data-build="chips">
        <li v-for="l in profile.links" :key="l.href">
          <a :href="l.href" target="_blank" rel="noopener">
            <FontAwesomeIcon :icon="iconFor(l.icon)" />
            {{ l.label }}
          </a>
        </li>
      </ul>
      <p class="c-cv muted" data-build="print">{{ profile.cvNote }}</p>
      <p class="c-done mono" data-build="type">{{ $t('contact.done') }}</p>
      <p class="c-updated mono muted" data-build="type">{{ $t('contact.updated', { date: formatDate(updated, true, $i18n.locale) }) }}</p>
    </div>
  </div>
</template>

<style scoped>
.contact {
  display: flex;
  align-items: center;
}

.c-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.c-main h2 {
  font-size: clamp(2.2rem, calc(var(--vw) * 5), 4rem);
}

.c-lead {
  color: var(--fg-muted);
  font-size: 1.1rem;
}

.c-mail {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 16px 28px;
}

.c-address {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.8rem, calc(var(--vw) * 4.6), 4rem);
  letter-spacing: -0.03em;
  color: var(--fg);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.c-address:hover {
  color: var(--line);
}

.rule {
  width: min(560px, 100%);
}

.c-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  font-size: 1.1rem;
}

.c-links a {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}

.c-cv {
  font-size: 1rem;
}

.c-done {
  margin-top: 36px;
  font-size: 0.85rem;
  color: var(--line);
}

.c-updated {
  margin-top: 6px;
  font-size: 0.75rem;
}
</style>
