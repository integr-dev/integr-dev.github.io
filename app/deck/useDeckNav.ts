import { sheets } from './sheets.config'
import { parsePath, pathFor } from './paths'
import type { Direction, SheetDef, SlideDef } from './types'

const slideKey = (sheetId: string, slideId: string) => `${sheetId}/${slideId}`

export function useDeckNav() {
  const router = useRouter()
  const route = useRoute()

  const x = useState('deck-x', () => 0)
  const slideId = useState<string | null>('deck-slide', () => null)
  const unlocked = useState<string[]>('deck-unlocked', () => [])
  const visited = useState<string[]>('deck-visited', () => [])
  const direction = useState<Direction>('deck-direction', () => 'right')

  const sheet = computed<SheetDef>(() => sheets[x.value]!)
  // one page per post, filled in by the Deck from the content (see slidesFrom)
  const postSlides = useState<SlideDef[]>('deck-post-slides', () => [])

  function allSlides(s: SheetDef): SlideDef[] {
    const extra = s.slidesFrom === 'posts' ? postSlides.value : []
    return [...(s.slides ?? []), ...extra]
  }

  function isUnlocked(sheetId: string, slide: SlideDef) {
    return !slide.hiddenUntilRevealed || unlocked.value.includes(slideKey(sheetId, slide.id))
  }

  function slidesOf(s: SheetDef): SlideDef[] {
    return allSlides(s).filter(slide => isUnlocked(s.id, slide))
  }

  const y = computed(() => {
    const slides = slidesOf(sheet.value)
    const i = slides.findIndex(s => s.id === slideId.value)
    return Math.max(0, i)
  })

  const yTotal = computed(() => Math.max(1, slidesOf(sheet.value).length))

  function pathOf(sheetIndex: number, slide?: string | null) {
    const s = sheets[sheetIndex]!
    return pathFor(s, slide, allSlides(s)[0]?.id ?? null)
  }

  /** The URL of the current position. */
  const path = computed(() => pathOf(x.value, slideId.value))

  function go(sheetIndex: number, slide?: string | null) {
    if (sheetIndex < 0 || sheetIndex >= sheets.length) return false
    const target = pathOf(sheetIndex, slide)
    if (target === route.path) return false
    router.push(target)
    return true
  }

  function goTo(sheetId: string, slide?: string) {
    const i = sheets.findIndex(s => s.id === sheetId)
    if (i < 0) return false
    if (slide) unlock(sheetId, slide)
    if (i === x.value && (slide ?? null) === (slideId.value ?? allSlides(sheets[i]!)[0]?.id ?? null)) return false
    return go(i, slide ?? null)
  }

  const nextSheet = () => go(x.value + 1)
  const prevSheet = () => go(x.value - 1)

  function nextSlide() {
    const slides = slidesOf(sheet.value)
    const target = slides[y.value + 1]
    return target ? go(x.value, target.id) : false
  }

  function prevSlide() {
    const slides = slidesOf(sheet.value)
    const target = slides[y.value - 1]
    return target ? go(x.value, target.id) : false
  }

  function unlock(sheetId: string, slide: string) {
    const key = slideKey(sheetId, slide)
    if (!unlocked.value.includes(key)) unlocked.value = [...unlocked.value, key]
  }

  function isVisited(sheetId: string) {
    return visited.value.includes(sheetId)
  }

  // The path is the single source of truth for the position. Returns false for a path that
  // is no position in the deck (the page then shows the 404).
  function applyPath(p: string) {
    const parsed = parsePath(p)
    if (!parsed) return false
    const target = sheets[parsed.index]!
    const targetSlides = allSlides(target)
    let nextSlideId: string | null = null
    if (target.mode === 'stack' && targetSlides.length) {
      const match = parsed.slide ? targetSlides.find(s => s.id === parsed.slide) : targetSlides[0]
      if (!match) return false
      unlock(target.id, match.id)
      nextSlideId = match.id
    }
    else if (parsed.slide) return false
    const i = parsed.index
    if (i !== x.value) direction.value = i > x.value ? 'right' : 'left'
    else if (nextSlideId !== slideId.value) direction.value = y.value < targetSlides.findIndex(s => s.id === nextSlideId) ? 'down' : 'up'
    x.value = i
    slideId.value = nextSlideId
    if (!visited.value.includes(target.id)) visited.value = [...visited.value, target.id]
    return true
  }

  return {
    sheets,
    x,
    y,
    yTotal,
    sheet,
    slideId,
    path,
    direction,
    unlocked,
    visited,
    slidesOf,
    isUnlocked,
    isVisited,
    go,
    goTo,
    nextSheet,
    prevSheet,
    nextSlide,
    prevSlide,
    unlock,
    applyPath,
  }
}
