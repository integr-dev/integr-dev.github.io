import type { Component } from 'vue'

export interface BuildOptions {
  signal: AbortSignal
  /** 0..1 while the sheet is being drawn, 1 when it is done. */
  onProgress: (p: number) => void
  /** 1 = normal; higher draws faster (the search panel uses 2.5) */
  speed?: number
}

/**
 * Draws a sheet (or a stack slide) whenever it comes into view. Sheets mark elements with
 * data-build="type | print | line | vline | path | count | chips | image | fade | custom".
 * A 'custom' element receives the DOM events build-run ({ detail: { resolve, signal } }),
 * build-reset and build-finish and animates itself.
 */
export interface Builder {
  run: (root: HTMLElement, opts: BuildOptions) => Promise<void>
  /** Back to the undrawn state, so the next visit draws it again. */
  reset: (root: HTMLElement) => void
  /** Take a drawn root apart again, last part first (used when the search panel closes). */
  unbuild: (root: HTMLElement, opts: { signal: AbortSignal }) => Promise<void>
  /** Show everything at once (reduced motion). */
  finish: (root: HTMLElement) => void
  /**
   * Hand the text back to the framework: undo any DOM rewriting (split letters) so the page can
   * update its text in place, e.g. on a language switch. Drawn parts stay drawn.
   */
  release?: (root: HTMLElement) => void
}

/**
 * What a theme must provide. See docs/SITE_SCHEMA.md §8 for the props each slot receives.
 * Colors, fonts and motion values come from the theme's CSS tokens.
 */
export interface Theme {
  name: string
  builder: Builder
  /** Full-viewport background. Props: x, total. */
  ThemeBackground: Component
  /** Fixed frame around the viewport. No props. */
  ViewportFrame: Component
  /** Layer above the sheets for build effects (pen, guides). No props. */
  BuildOverlay?: Component
  /** Position UI. Props: x, total, y, yTotal, titles, ids, visited, handle, progress. Emits go, prev, next, up, down, search. */
  DeckIndicator: Component
  /** Search shell. Props: open, query, results, activeIndex. Emits select, close, update:query, move. */
  SearchSkin: Component
  /** Optional decoration that reacts to search hits. Props: target ({ anchor, nonce } | null). */
  Ornament?: Component
}
