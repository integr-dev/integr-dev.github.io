import { sheets } from './sheets.config'
import type { SheetDef } from './types'

// URLs of the deck positions. Every position is a real path (/projects/osmium/readme), so each one
// is its own page for search engines, while moving between them stays inside the single page app.

export function basePath(s: SheetDef) {
  return s.path ?? (s === sheets[0] ? '/' : `/${s.id}`)
}

/** The path of a sheet, or of one of its stack slides (the first slide is the sheet itself). */
export function pathFor(s: SheetDef, slide?: string | null, firstSlide?: string | null) {
  const base = basePath(s)
  return slide && slide !== firstSlide ? `${base === '/' ? '' : base}/${slide}` : base
}

/** The sheet a path points at and the slide id after it, if any. Null if no sheet matches. */
export function parsePath(path: string): { index: number, slide: string | null } | null {
  const clean = path.replace(/\/+$/, '') || '/'
  let found: { index: number, slide: string | null } | null = null
  let foundLen = -1
  for (const [index, s] of sheets.entries()) {
    const base = basePath(s)
    if (base.length <= foundLen) continue
    if (clean === base) {
      found = { index, slide: null }
      foundLen = base.length
    }
    else if (base !== '/' && s.mode === 'stack' && clean.startsWith(`${base}/`)) {
      const rest = clean.slice(base.length + 1)
      if (rest.includes('/')) continue
      found = { index, slide: rest }
      foundLen = base.length
    }
  }
  return found
}

/** Old links used the hash (/#/helix/readme); turns one into the path it means now. */
export function pathFromHash(hash: string) {
  const [, sheetId, slide] = hash.replace(/^#/, '').split('/')
  const s = sheets.find(x => x.id === sheetId)
  return s ? pathFor(s, slide ?? null, s.slides?.[0]?.id ?? null) : null
}

/** Every position known without the content: the sheets and their static stack slides. */
export function staticPaths() {
  return sheets.flatMap(s => [basePath(s), ...(s.slides ?? []).slice(1).map(sl => pathFor(s, sl.id))])
}

// German lives under /de (nuxt.config i18n, prefix_except_default); positions are the same.

/** The path without its language prefix. */
export function stripLocale(path: string) {
  if (path === '/de') return '/'
  return path.startsWith('/de/') ? path.slice(3) : path
}

/** A position path in the given language. */
export function withLocale(path: string, locale: string) {
  if (locale !== 'de') return path
  return path === '/' ? '/de' : `/de${path}`
}
