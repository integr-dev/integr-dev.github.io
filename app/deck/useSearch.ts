import type { SearchEntry } from './types'
import { sheets } from './sheets.config'

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export async function useSearchIndex() {
  const { projects, posts, timeline, skills } = await useSiteContent()

  return computed<SearchEntry[]>(() => {
    const entries: SearchEntry[] = []

    for (const p of projects.value) {
      const slug = p.stem.split('/').pop()!
      const base = { label: p.title, kind: 'project' as const, text: `${p.tagline} ${p.stack.join(' ')}`, anchor: `project-${slug}` }
      if (p.tier === 'flagship') entries.push({ ...base, sheetId: slug })
      else entries.push({ ...base, sheetId: 'projects', slideId: p.tier === 'more' ? 'more' : 'main' })
    }

    for (const p of posts.value) {
      const slug = p.path.split('/').pop()!
      entries.push({ label: p.title, kind: 'post', text: `${p.summary} ${(p.tags ?? []).join(' ')}`, sheetId: 'posts', slideId: slug, anchor: `post-${slug}` })
    }

    timeline.value.forEach((t, i) => {
      entries.push({ label: t.title, kind: 'timeline', text: `${t.when} ${t.detail ?? ''}`, sheetId: 'timeline', anchor: `tl-${i}` })
    })

    for (const c of skills.value) {
      for (const item of c.items) {
        entries.push({ label: item, kind: 'skill', text: c.category, sheetId: 'skills', anchor: `skill-${slugify(item)}` })
      }
    }

    for (const s of sheets) {
      if (!entries.some(e => e.kind === 'project' && e.sheetId === s.id)) {
        entries.push({ label: s.title, kind: 'sheet', text: '', sheetId: s.id })
      }
    }

    return entries
  })
}

/** Literal matches first, then fuzzy (characters in order) on the label. */
export function searchEntries(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const scored: { e: SearchEntry, score: number }[] = []
  for (const e of entries) {
    const label = e.label.toLowerCase()
    const text = e.text.toLowerCase()
    let score = 0
    if (label === q) score = 100
    else if (label.startsWith(q)) score = 80
    else if (label.includes(q)) score = 60
    else if (text.includes(q)) score = 40
    else if (fuzzy(label, q)) score = 20
    if (score) scored.push({ e, score: score + (e.kind === 'project' ? 5 : 0) })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.e)
}

function fuzzy(hay: string, needle: string) {
  let i = 0
  for (const c of hay) if (c === needle[i]) i++
  return i === needle.length
}
