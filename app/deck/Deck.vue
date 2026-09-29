<script setup lang="ts">
import { theme } from '~/themes/active'
import { useLightbox } from '~/composables/useLightbox'
import ImageLightbox from '~/components/ImageLightbox.vue'
import { sheetComponents } from '~/sheets'
import SearchBar from './SearchBar.vue'
import { useDeckNav } from './useDeckNav'
import { useBuild } from './useBuild'
import { pathFromHash } from './paths'
import { unzoomRect } from '~/utils/zoom'
import type { SheetDef } from './types'

const nav = useDeckNav()
const route = useRoute()
const router = useRouter()
const { profile } = await useSiteContent()
const searchOpen = useState('search-open', () => false)
const lightbox = useLightbox()
const highlight = useState<{ anchor: string, nonce: number } | null>('deck-highlight', () => null)
const narrow = ref(false)
// true for the first frames after load: a deep link jumps straight to its sheet, no slide from the intro
const instant = ref(true)
const feeds = ref<Record<string, HTMLElement>>({})

// The page (pages/[...slug].vue) applies the path it was opened on before the deck renders, so
// the server already renders the right sheet. Moving around changes the path.
watch(() => route.path, p => nav.applyPath(p))

const build = useBuild(nav, narrow)
watch(nav.unlocked, () => build.refresh())

const { t, te, locale } = useI18n()
// Language switch: the texts change in place. Just before Vue patches them, the builder hands
// back the text it split into letters; drawn parts stay drawn, nothing is drawn again.
watch(locale, () => {
  document.querySelectorAll<HTMLElement>('[data-build-root]').forEach(root => theme.builder.release?.(root))
}, { flush: 'pre' })
// flagships are named after their project; the other sheets have translated names
const sheetTitle = (s: SheetDef) => (te(`sheets.${s.id}`) ? t(`sheets.${s.id}`) : s.title)
const titles = computed(() => nav.sheets.map(sheetTitle))
const ids = nav.sheets.map(s => s.id)

function componentFor(name?: string) {
  return name ? sheetComponents[name] : undefined
}

function slideIndex(sheet: SheetDef) {
  return sheet.id === nav.sheet.value.id ? nav.y.value : 0
}

// ---------- input ----------

/** The element that scrolls on the current position: the posts feed, or a [data-scroll] area in a slide. */
function feedEl(): HTMLElement | undefined {
  const sheet = nav.sheet.value
  if (sheet.mode === 'feed') return feeds.value[sheet.id]
  if (sheet.mode === 'stack') {
    return document.getElementById(`slide-${sheet.id}-${nav.slideId.value}`)?.querySelector<HTMLElement>('[data-scroll]') ?? undefined
  }
  return undefined
}

/** Is there a page below the current one? Drives the down arrow. */
const hasBelow = computed(() => nav.sheet.value.mode === 'stack' && nav.y.value < nav.yTotal.value - 1)
// any page below another one (readme, More, a post) has a way back up as well
const hasAbove = computed(() => nav.sheet.value.mode === 'stack' && nav.y.value > 0)
// The arrows fade in once, on first load, as the first bush flowers open (the bottom-left bush:
// 900ms delay + 1400ms growing + 200ms, PixelBush.vue); arrows that appear later show at once.
const ARROWS_IN_MS = 2500
const arrowsIn = ref(false)
onMounted(() => setTimeout(() => (arrowsIn.value = true), ARROWS_IN_MS))

// a post page (below the post list)
const onPost = computed(() => nav.sheet.value.slidesFrom === 'posts' && nav.y.value > 0)

function canScroll(el: HTMLElement | undefined, dy: number) {
  if (!el) return false
  if (dy > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1
  return el.scrollTop > 0
}

function down() {
  if (nav.sheet.value.mode === 'stack') return nav.nextSlide() || nav.nextSheet()
  return nav.nextSheet()
}

function up() {
  if (nav.sheet.value.mode === 'stack') return nav.prevSlide() || nav.prevSheet()
  return nav.prevSheet()
}

function isTyping(e: Event) {
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

function onKey(e: KeyboardEvent) {
  if (lightbox.isOpen.value || fromStudio(e)) return
  // Space, Enter or Escape while a sheet is being drawn: show it at once
  if (build.building.value && !isTyping(e) && !searchOpen.value && [' ', 'Enter', 'Escape'].includes(e.key)) {
    e.preventDefault()
    build.skip()
    return
  }
  const openSearch = (e.key === '/' && !isTyping(e))
    || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))
    || (e.code === 'Space' && e.altKey)
  if (openSearch) {
    e.preventDefault()
    searchOpen.value = true
    return
  }
  if (searchOpen.value || isTyping(e) || narrow.value || e.metaKey || e.ctrlKey || e.altKey) return

  const feed = feedEl()
  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
      e.preventDefault(); nav.nextSheet(); break
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault(); nav.prevSheet(); break
    case 'ArrowDown':
      e.preventDefault()
      if (feed && canScroll(feed, 1)) feed.scrollBy({ top: 120, behavior: 'smooth' })
      else down()
      break
    case 'ArrowUp':
      e.preventDefault()
      if (feed && canScroll(feed, -1)) feed.scrollBy({ top: -120, behavior: 'smooth' })
      else up()
      break
    case 'Home':
      e.preventDefault()
      if (feed) feed.scrollTo({ top: 0 })
      else nav.go(0)
      break
    case 'End':
      e.preventDefault()
      if (feed) feed.scrollTo({ top: feed.scrollHeight })
      else nav.go(nav.sheets.length - 1)
      break
  }
}

// Wheel and trackpad: one gesture moves one step. Momentum after a step is swallowed
// until the wheel goes quiet, so a single swipe never skips sheets.
let locked = false
// set by a page change: the rest of that gesture must not scroll the page it lands on either
let turned = false
let lastMove = 0
let lastWheel = 0
let acc = 0

function onWheel(e: WheelEvent) {
  if (narrow.value || searchOpen.value || lightbox.isOpen.value || fromStudio(e)) return
  const now = performance.now()
  const gap = now - lastWheel
  lastWheel = now
  const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
  const d = horizontal ? e.deltaX : e.deltaY

  e.preventDefault()

  if (turned) {
    if (now - lastMove > 650 && gap > 140) turned = locked = false
    else return
  }

  const scroller = feedEl()
  // text not drawn yet (waiting to be, or being drawn, also right after a reload) stays at its top
  if (!horizontal && scroller && !scroller.closest('[data-build-root]')?.classList.contains('is-built')) return
  if (!horizontal && canScroll(scroller, d)) {
    // Scroll the feed or readme ourselves, wherever the pointer is. The browser would only scroll
    // it with the pointer on top of it and let the event through to page navigation otherwise.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? scroller!.clientHeight : 1
    scroller!.scrollTop += d * unit
    acc = 0
    // momentum that reaches the end must not carry on into the next page
    locked = true
    lastMove = now
    return
  }

  if (locked) {
    if (now - lastMove > 650 && gap > 140) locked = false
    else return
  }
  if (gap > 200) acc = 0
  acc += d
  if (Math.abs(acc) < 30) return

  const forward = acc > 0
  acc = 0
  const moved = horizontal
    ? (forward ? nav.nextSheet() : nav.prevSheet())
    : (forward ? down() : up())
  if (moved) {
    locked = turned = true
    lastMove = now
  }
}

let touchStart: { x: number, y: number } | null = null

function onTouchStart(e: TouchEvent) {
  const t = fromStudio(e) ? undefined : e.touches[0]
  touchStart = t ? { x: t.clientX, y: t.clientY } : null
}

function onTouchEnd(e: TouchEvent) {
  if (!touchStart || narrow.value || searchOpen.value) return
  const t = e.changedTouches[0]
  if (!t) return
  const dx = t.clientX - touchStart.x
  const dy = t.clientY - touchStart.y
  touchStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) nav.nextSheet()
    else nav.prevSheet()
  }
  else if (!canScroll(feedEl(), -dy)) {
    if (dy < 0) down()
    else up()
  }
}

let mq: MediaQueryList | undefined
const onMq = () => (narrow.value = !!mq?.matches)

/**
 * A link to a heading in a post or readme (/posts/x#setup): scroll that slide's text so the heading
 * sits at the top. Also when the page is opened with such a link.
 */
function scrollToHash(smooth: boolean) {
  const id = decodeURIComponent(route.hash.slice(1))
  const el = id && !id.startsWith('/') ? document.getElementById(id) : null
  if (!el) return
  const box = el.closest<HTMLElement>('[data-scroll]')
  if (!box || box.scrollHeight <= box.clientHeight) {
    el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' })
    return
  }
  const top = unzoomRect(el.getBoundingClientRect()).top - unzoomRect(box.getBoundingClientRect()).top + box.scrollTop - 16
  box.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}
watch(() => route.hash, () => nextTick(() => scrollToHash(true)))

onMounted(() => {
  mq = window.matchMedia('(max-width: 767px)')
  onMq()
  // links from before the deck had paths (/#/helix/readme) still land in the right place
  const legacy = route.hash.startsWith('#/') ? pathFromHash(route.hash) : null
  if (legacy) router.replace(legacy)
  // on phones the deck is one long scroll: start at the position the link points to
  else if (narrow.value && route.path !== '/') {
    const sheet = nav.sheet.value
    const slide = sheet.mode === 'stack' && nav.y.value > 0 ? document.getElementById(`slide-${sheet.id}-${nav.slideId.value}`) : null
    // pages left out on phones (readme, More) fall back to their sheet
    const target = slide?.getClientRects().length ? slide : document.getElementById(`sheet-${sheet.id}`)
    target?.scrollIntoView()
  }
  // a link to a heading: once the slide is laid out
  if (!legacy && route.hash) requestAnimationFrame(() => scrollToHash(false))
  requestAnimationFrame(() => requestAnimationFrame(() => (instant.value = false)))
  // the first sheet is drawn once the viewport frame has been traced
  nextTick(() => build.start(route.path !== '/' || legacy ? 400 : 900))
  mq.addEventListener('change', onMq)
  window.addEventListener('keydown', onKey)
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
})

onBeforeUnmount(() => {
  build.stop()
  mq?.removeEventListener('change', onMq)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend', onTouchEnd)
})

/** A click on the page (not on a link or control) while a sheet is being drawn skips the drawing. */
function onPointerDown(e: PointerEvent) {
  if (!build.building.value || narrow.value) return
  if ((e.target as HTMLElement).closest('a, button, input, [data-scroll], .f-shot')) return
  build.skip()
}

function setFeed(id: string, el: unknown) {
  if (el instanceof HTMLElement) feeds.value[id] = el
}
</script>

<template>
  <div class="deck" :class="{ 'is-instant': instant, 'arrows-in': arrowsIn }" :style="{ '--x': nav.x.value }">
    <component :is="theme.ThemeBackground" :x="narrow ? 0 : nav.x.value" :total="nav.sheets.length" />
    <component :is="theme.ViewportFrame" />

    <main class="deck-viewport" @pointerdown="onPointerDown">
      <div class="deck-track">
        <section
          v-for="(sheet, i) in nav.sheets"
          :id="`sheet-${sheet.id}`"
          :key="sheet.id"
          class="deck-sheet"
          :class="[`mode-${sheet.mode}`, { 'is-active': i === nav.x.value }]"
          :aria-label="sheetTitle(sheet)"
          :inert="!narrow && i !== nav.x.value ? true : undefined"
        >
          <div v-if="sheet.mode === 'single'" class="deck-slide" data-build-root>
            <component :is="componentFor(sheet.component)" v-bind="sheet.props" />
          </div>

          <div v-else-if="sheet.mode === 'stack'" class="deck-stack" :style="{ '--y': slideIndex(sheet) }">
            <div
              v-for="slide in nav.slidesOf(sheet)"
              :id="`slide-${sheet.id}-${slide.id}`"
              :key="slide.id"
              class="deck-slide"
              :data-slide="slide.id"
              :data-folded="sheet.slidesFrom === 'posts' && slide.id !== nav.slideId.value && slide.id !== nav.slidesOf(sheet)[0]?.id ? '' : undefined"
              data-build-root
            >
              <component :is="componentFor(slide.component)" v-bind="slide.props" :sheet-id="sheet.id" />
            </div>
          </div>

          <div v-else :ref="el => setFeed(sheet.id, el)" class="deck-feed" data-build-root>
            <component :is="componentFor(sheet.component)" v-bind="sheet.props" />
          </div>
        </section>
      </div>
    </main>

    <component
      :is="theme.DeckIndicator"
      :x="nav.x.value"
      :total="nav.sheets.length"
      :y="nav.y.value"
      :y-total="nav.yTotal.value"
      :titles="titles"
      :ids="ids"
      :visited="nav.visited.value"
      :handle="profile?.handle ?? ''"
      :progress="build.progress.value"
      @go="(i: number) => nav.go(i)"
      @prev="nav.prevSheet()"
      @next="nav.nextSheet()"
      @up="nav.prevSlide()"
      @down="nav.nextSlide()"
      @search="searchOpen = true"
    />

    <!-- left / right to the neighbouring sheets -->
    <button v-if="nav.x.value > 0 && !narrow" type="button" class="deck-prev" :aria-label="t('titleBlock.prev')" @click="nav.prevSheet()">
      <FontAwesomeIcon icon="arrow-left" />
    </button>
    <button
      v-if="nav.x.value < nav.sheets.length - 1 && !narrow"
      type="button"
      class="deck-next"
      :aria-label="nav.x.value === 0 ? t('deck.nextSheet') : t('titleBlock.next')"
      @click="nav.nextSheet()"
    >
      <FontAwesomeIcon icon="arrow-right" />
    </button>

    <!-- top centre: the way up, and on a post also straight back to the list, left of it -->
    <div v-if="hasAbove && !narrow" class="deck-up-group">
      <!-- a double arrow and a label, set apart by a rule: all the way up, not one page -->
      <template v-if="onPost">
        <button type="button" class="deck-posts mono" :title="t('posts.all')" @click="nav.goTo('posts', 'list')">
          <FontAwesomeIcon icon="angles-up" /> {{ t('posts.all') }}
        </button>
        <span class="deck-up-sep" aria-hidden="true" />
      </template>
      <button type="button" class="deck-up" :aria-label="t('deck.above')" :title="t('deck.above')" @click="up()">
        <FontAwesomeIcon icon="arrow-up" />
      </button>
    </div>

    <button v-if="hasBelow && !narrow" type="button" class="deck-down" :aria-label="t('deck.below')" @click="down()">
      <FontAwesomeIcon icon="arrow-down" />
    </button>

    <SearchBar />
    <ImageLightbox />
    <ClientOnly>
      <component :is="theme.BuildOverlay" v-if="theme.BuildOverlay" />
      <component :is="theme.Ornament" v-if="theme.Ornament" :target="highlight" />
    </ClientOnly>
  </div>
</template>

<style scoped>
.deck {
  position: relative;
  height: calc(var(--dvh) * 100);
  overflow: clip;
}

.deck-viewport {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: clip;
}

.deck-track {
  display: flex;
  height: 100%;
  transform: translateX(calc(var(--x) * calc(var(--vw) * -100)));
  transition: transform var(--transition-duration) var(--transition-ease);
}

.deck-sheet {
  flex: 0 0 calc(var(--vw) * 100);
  width: calc(var(--vw) * 100);
  height: 100%;
  overflow: clip;
}

.deck-stack {
  height: 100%;
  transform: translateY(calc(var(--y) * -100%));
  transition: transform var(--transition-duration) var(--transition-ease);
}

.deck-slide {
  height: 100%;
  overflow: clip;
}

.deck-feed {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
}

@media (prefers-reduced-motion: reduce) {
  .deck-track,
  .deck-stack {
    transition: none;
  }
}

.is-instant .deck-track,
.is-instant .deck-stack,
.is-instant :deep(.paper) {
  transition: none;
}

@media (max-width: 767px) {
  .deck {
    height: auto;
    overflow: visible;
  }

  .deck-viewport {
    overflow: visible;
  }

  .deck-track {
    display: block;
    transform: none;
  }

  .deck-sheet {
    width: auto;
    height: auto;
    overflow: visible;
  }

  .deck-stack {
    transform: none;
  }

  .deck-slide,
  .deck-feed {
    height: auto;
    overflow: visible;
  }

  /* phones get the essentials: no readme pages, no list of older projects */
  .deck-slide[data-slide='readme'],
  .deck-slide[data-slide='more'] {
    display: none;
  }

  /* posts stay folded under the list; only the one opened from it is shown */
  .deck-slide[data-folded] {
    display: none;
  }
}
</style>
