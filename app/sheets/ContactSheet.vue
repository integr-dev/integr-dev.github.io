<script setup lang="ts">
const { profile } = await useSiteContent()

const iconFor = (name: string) => (name === 'github' ? ['fab', 'github'] : ['fas', name])
</script>

<template>
  <div v-if="profile" class="sheet contact">
    <div class="c-main">
      <h2 data-build="type">Contact</h2>
      <p class="c-lead" data-build="print">Email is the fastest way to reach me.</p>
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
      <p class="c-done mono" data-build="type">Done.</p>
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
  font-size: clamp(2.2rem, 5vw, 4rem);
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
  font-size: clamp(1.8rem, 4.6vw, 4rem);
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
</style>
