export type SheetMode = 'single' | 'stack' | 'feed'

export interface SlideDef {
  id: string
  component: string
  /** Cannot be reached until unlocked by the More button or by search. */
  hiddenUntilRevealed?: boolean
  props?: Record<string, unknown>
}

export interface SheetDef {
  id: string
  title: string
  /** URL of the sheet; defaults to `/<id>` (the first sheet is `/`). Stack slides add `/<slide id>`. */
  path?: string
  mode: SheetMode
  /** For 'single' and 'feed'. */
  component?: string
  /** For 'stack'. */
  slides?: SlideDef[]
  /** For 'stack': more slides generated from content, appended after `slides` (one page per post). */
  slidesFrom?: 'posts'
  props?: Record<string, unknown>
}

export type Direction = 'left' | 'right' | 'up' | 'down'

export interface SearchEntry {
  label: string
  kind: 'project' | 'post' | 'timeline' | 'skill' | 'sheet'
  text: string
  sheetId: string
  slideId?: string
  /** DOM id of the element to highlight after navigating. */
  anchor?: string
  /** Route to open instead of navigating the deck (posts). */
  to?: string
}
