<script setup lang="ts">
import PixelAvatar from './PixelAvatar.vue'
import PixelVine from '~/themes/drafting/PixelVine.vue'
import { useDeckNav } from '~/deck/useDeckNav'

const { profile } = await useSiteContent()

// Render the build-time age, then refresh it in the browser so a static build never goes stale.
const age = useState('intro-age', () => (profile.value ? ageFrom(profile.value.birth) : null))

const nav = useDeckNav()
const { t, locale } = useI18n()
// English roles read as common nouns in running text; German nouns keep their capital
const role = computed(() => (profile.value ? (locale.value === 'de' ? profile.value.role : profile.value.role.toLowerCase()) : ''))

// shortcuts from the first screen to the places people look for most
const shortcuts = [
  { key: 'projects', sheet: 'osmium' },
  { key: 'posts', sheet: 'posts' },
  { key: 'contact', sheet: 'contact' },
]

// on phones the deck is one vertical scroll, so scroll there instead of switching sheets
function open(sheet: string) {
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.getElementById(`sheet-${sheet}`)?.scrollIntoView({ behavior: 'smooth' })
  }
  else nav.goTo(sheet)
}

onMounted(() => {
  if (profile.value) age.value = ageFrom(profile.value.birth)
})

// The big name types itself (a data-build="custom" part: the builder starts it), then keeps
// deleting and retyping between the handle and the first name.
const names = computed(() => (profile.value ? [profile.value.handle, profile.value.name.toLowerCase()] : []))
const shown = ref(names.value[0] ?? '')
const typing = ref(false)
let run = 0

const TYPE_MS = 110
const DELETE_MS = 60
const HOLD_MS = 2600

const wait = (ms: number, id: number) =>
  new Promise<boolean>(resolve => setTimeout(() => resolve(id === run), ms))

async function typeWord(word: string, id: number, perChar: number) {
  typing.value = true
  for (let i = shown.value.length; i < word.length; i++) {
    if (!(await wait(perChar, id))) return false
    shown.value = word.slice(0, i + 1)
  }
  typing.value = false
  return true
}

async function deleteWord(id: number) {
  typing.value = true
  while (shown.value.length) {
    if (!(await wait(DELETE_MS, id))) return false
    shown.value = shown.value.slice(0, -1)
  }
  typing.value = false
  return true
}

async function loop(id: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let i = 0
  while (id === run) {
    if (!(await wait(HOLD_MS, id)) || !(await deleteWord(id))) return
    i = (i + 1) % names.value.length
    if (!(await wait(250, id)) || !(await typeWord(names.value[i]!, id, TYPE_MS))) return
  }
}

function onBuildRun(e: Event) {
  const { resolve, speed } = (e as CustomEvent<{ resolve: () => void, speed: number }>).detail
  const id = ++run
  shown.value = ''
  typeWord(names.value[0]!, id, TYPE_MS / speed).then((done) => {
    resolve()
    if (done) loop(id)
  })
}

function onBuildReset() {
  run++
  typing.value = false
  shown.value = ''
}

function onBuildFinish() {
  const id = ++run
  typing.value = false
  shown.value = names.value[0] ?? ''
  loop(id)
}

onBeforeUnmount(() => run++)

// the vines grow on their own; the drawing does not wait for them
const vines = ref<HTMLElement>()
function vinesRun(e: Event) {
  const { resolve } = (e as CustomEvent<{ resolve: () => void }>).detail
  vines.value?.classList.remove('is-leaving')
  resolve()
}
// when the deck moves off this sheet the vines come apart while it slides away (the builder
// resets the sheet once it is out of view, which calls vinesReset); a class set by hand, since the
// element has data-build
watch(() => nav.x.value, (x, was) => {
  if (was === 0 && x !== 0) vines.value?.classList.add('is-leaving')
})
const vinesReset = () => vines.value?.classList.remove('is-leaving')
</script>

<template>
  <div v-if="profile" class="sheet intro">
    <div class="intro-text">
      <!-- first in the markup so they are drawn first; placed top right by CSS -->
      <ul class="intro-links mono" data-build="chips" data-nopen>
        <li v-for="s in shortcuts" :key="s.sheet">
          <button type="button" @click="open(s.sheet)">
            {{ t(`intro.shortcuts.${s.key}`) }} <FontAwesomeIcon icon="arrow-right" />
          </button>
        </li>
      </ul>
      <figure class="intro-figure">
        <PixelAvatar />
        <figcaption class="mono muted" data-build="type">184 × 184 px, 1:1</figcaption>
      </figure>

      <!-- decorative handle; the page heading (h1) is the full name line below, visible text for search engines -->
      <div class="intro-name" aria-hidden="true">
        <span class="type-name" data-build="custom" @build-run="onBuildRun" @build-reset="onBuildReset" @build-finish="onBuildFinish">{{ shown }}<span class="type-caret" :data-typing="typing ? '' : undefined" /></span>
      </div>
      <span class="rule" data-build="line" />
      <h1 class="intro-facts" data-build="type">
        {{ t('intro.facts', { name: profile.fullName, age, role, location: profile.location }) }}
      </h1>
      <p class="intro-pitch" data-build="print">
        {{ profile.pitch }}
      </p>
      <p class="intro-looking" data-build="type">
        {{ profile.lookingFor }}
      </p>
      <p class="intro-hint mono muted" data-build="fade" data-nopen>
        <span><kbd>→</kbd> {{ t('intro.hints.next') }}</span>
        <span><kbd>/</kbd> {{ t('intro.hints.search') }}</span>
        <span><kbd>{{ t('intro.hints.skipKey') }}</kbd> {{ t('intro.hints.skip') }}</span>
      </p>
    </div>
    <!-- vines hanging into the empty half of the sheet, grown last: two out of the small bushes on
         the top edge (ThemeBackground.vue), one out of the top-right bush -->
    <div ref="vines" class="intro-vines" aria-hidden="true" data-build="custom" data-nopen @build-run="vinesRun" @build-reset="vinesReset">
      <PixelVine :seed="5" :length="44" :drift="-0.35" class="vine-a" />
      <PixelVine :seed="17" :length="30" :drift="-0.15" :sway="2" :delay="500" class="vine-b" />
      <PixelVine :seed="29" :length="60" :drift="-0.6" :sway="3" :delay="250" class="vine-c" />
    </div>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  align-items: center;
}

.intro-text {
  max-width: 760px;
}

/* behind the text (the shortcuts are placed against the sheet, so the text stays unpositioned) */
.intro-vines {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.intro-vines > :deep(.pixel-vine) {
  position: absolute;
}

/* where the stems start, measured from the right so they stay left of the shortcut buttons
   (about 420px wide), just inside the bottom of the bushes they hang from */
.intro-vines > .vine-a {
  top: 32px;
  left: calc(100% - var(--frame-gap) - var(--pad) - 440px);
}

.intro-vines > .vine-b {
  top: 24px;
  left: calc(100% - var(--frame-gap) - var(--pad) - 610px);
}

/* out of the top-right bush: placed by its left edge */
.intro-vines > .vine-c {
  top: var(--frame-gap);
  left: 85%;
  margin-left: 0;
}

/* only where the text leaves room for them */
@media (max-width: 1099px) {
  .intro-vines {
    display: none;
  }
}

.intro-figure {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 40px;
}

figcaption {
  font-size: 0.72rem;
}

.intro-name {
  font-family: var(--font-pixel);
  font-weight: var(--font-pixel-weight);
  font-synthesis: none;
  letter-spacing: 0;
  font-size: clamp(3.5rem, calc(var(--vw) * 10), 8.5rem);
  line-height: 1;
  height: 1.2em;
  overflow: clip;
}

.type-name {
  display: inline-block;
  line-height: 1.2;
  white-space: nowrap;
}

/* the caret blinks while waiting and stays solid while typing */
.type-caret {
  display: inline-block;
  width: max(2px, 0.08em);
  height: 0.82em;
  margin-left: 0.06em;
  vertical-align: -0.04em;
  background: var(--accent);
  animation: caret-blink 1.05s steps(1, end) infinite;
}

.type-caret[data-typing] {
  animation: none;
}

@keyframes caret-blink {
  50% { opacity: 0; }
}

.rule {
  width: min(420px, 100%);
  margin: 28px 0 24px;
}

.intro-facts {
  /* an h1 for search engines, styled like body text */
  font-family: var(--font-body);
  font-weight: 400;
  letter-spacing: normal;
  line-height: 1.55;
  font-size: 1.35rem;
  color: var(--fg);
}

.intro-pitch {
  max-width: 34ch;
  margin-top: 10px;
  font-size: 1.15rem;
  color: var(--fg-muted);
}

.intro-looking {
  margin-top: 18px;
  font-size: 1.05rem;
  color: var(--line);
}

.intro-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  /* top right corner of the sheet, inside the frame */
  position: absolute;
  top: calc(var(--frame-gap) + var(--pad));
  right: calc(var(--frame-gap) + var(--pad));
}

.intro-links button {
  font: inherit;
  font-size: 0.9rem;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 8px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.intro-links button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.intro-hint {
  display: flex;
  gap: 24px;
  margin-top: 40px;
  font-size: 0.8rem;
}

kbd {
  font: inherit;
  color: var(--accent);
  border: 1px solid var(--line-strong);
  padding: 0 5px;
  margin-right: 6px;
}

@media (max-width: 767px) {
  /* on phones the shortcuts sit below the text again */
  .intro-text {
    display: flex;
    flex-direction: column;
  }

  .intro-links {
    position: static;
    order: 1;
    margin-top: 28px;
  }

  /* the image size note and keyboard hints mean nothing on a phone */
  .intro-figure figcaption,
  .intro-hint {
    display: none;
  }

  .intro {
    min-height: calc(var(--svh) * 100);
  }

  .intro-looking {
  margin-top: 18px;
  font-size: 1.05rem;
  color: var(--line);
}

.intro-hint {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .type-caret {
    animation: none;
  }
}
</style>
