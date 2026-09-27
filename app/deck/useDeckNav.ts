import { sheets } from './sheets.config'
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

  function isUnlocked(sheetId: string, slide: SlideDef) {
    return !slide.hiddenUntilRevealed || unlocked.value.includes(slideKey(sheetId, slide.id))
  }

  function slidesOf(s: SheetDef): SlideDef[] {
    return (s.slides ?? []).filter(slide => isUnlocked(s.id, slide))
  }

  const y = computed(() => {
    const slides = slidesOf(sheet.value)
    const i = slides.findIndex(s => s.id === slideId.value)
    return Math.max(0, i)
  })

  const yTotal = computed(() => Math.max(1, slidesOf(sheet.value).length))

  function hashFor(sheetIndex: number, slide?: string | null) {
    const s = sheets[sheetIndex]!
    const first = s.slides?.[0]?.id
    return slide && slide !== first ? `#/${s.id}/${slide}` : `#/${s.id}`
  }

  function go(sheetIndex: number, slide?: string | null) {
    if (sheetIndex < 0 || sheetIndex >= sheets.length) return false
    const hash = sheetIndex === 0 && !slide ? '' : hashFor(sheetIndex, slide)
    if (hash === route.hash || (hash === '' && !route.hash)) return false
    router.push({ path: '/', hash })
    return true
  }

  function goTo(sheetId: string, slide?: string) {
    const i = sheets.findIndex(s => s.id === sheetId)
    if (i < 0) return false
    if (slide) unlock(sheetId, slide)
    if (i === x.value && (slide ?? null) === (slideId.value ?? sheets[i]!.slides?.[0]?.id ?? null)) return false
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

  // The hash is the single source of truth for the position.
  function applyHash(hash: string) {
    const [, sheetId, slide] = hash.replace(/^#/, '').split('/')
    let i = sheets.findIndex(s => s.id === sheetId)
    if (i < 0) i = 0
    const target = sheets[i]!
    let nextSlideId: string | null = null
    if (target.mode === 'stack' && target.slides?.length) {
      const match = target.slides.find(s => s.id === slide)
      if (match) unlock(target.id, match.id)
      nextSlideId = match?.id ?? target.slides[0]!.id
    }
    if (i !== x.value) direction.value = i > x.value ? 'right' : 'left'
    else if (nextSlideId !== slideId.value) direction.value = y.value < (target.slides?.findIndex(s => s.id === nextSlideId) ?? 0) ? 'down' : 'up'
    x.value = i
    slideId.value = nextSlideId
    if (!visited.value.includes(target.id)) visited.value = [...visited.value, target.id]
  }

  return {
    sheets,
    x,
    y,
    yTotal,
    sheet,
    slideId,
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
    applyHash,
  }
}
