import type { ProjectsCollectionItem as Project, ProjectsDeCollectionItem as ProjectDe } from '@nuxt/content'
import live from '#build/live-stats.mjs'

const baseName = (stem: string) => stem.split('/').pop()!

/** The numbers the build fetched (modules/live-stats.ts) over the ones in the file. */
function withLiveStats(p: Project): Project {
  const fresh = live[baseName(p.stem)]
  if (!fresh) return p
  return {
    ...p,
    stats: p.stats && {
      ...p.stats,
      asOf: fresh.asOf,
      items: p.stats.items.map(i => ({ ...i, value: fresh.items[i.label] ?? i.value })),
    },
    badge: p.badge && { ...p.badge, value: fresh.badge ?? p.badge.value },
  }
}

/** The English project with the German text laid over it (content/de/projects/<same name>.md). */
function localizeProject(p: Project, de?: ProjectDe): Project {
  if (!de) return p
  let alt = 0
  const visuals = p.visuals?.map(v => ({
    ...v,
    chart: v.chart && de.chart ? { ...v.chart, ...de.chart } : v.chart,
    images: v.images?.map(img => ({ ...img, alt: de.alts?.[alt++] ?? img.alt })),
  }))
  return {
    ...p,
    tagline: de.tagline ?? p.tagline,
    why: de.why ?? p.why,
    built: de.built ?? p.built,
    badge: p.badge && de.badgeLabel ? { ...p.badge, label: de.badgeLabel } : p.badge,
    visuals,
    body: de.body?.value?.length ? de.body : p.body,
  }
}

/**
 * All site content in the current language. English is the source; for German, content/de/
 * holds only the translated text and is merged over it. Readmes and posts stay English.
 * Both languages are loaded together (the content is small), so a language switch only picks the
 * other one: everything shown updates in place and the page is not rebuilt.
 */
/** German skills: English names, order and ratings; category names and text from the German file. */
function localizeSkills<T extends { categories: { category: string, items: { name: string, what: string, rating?: number, why?: string }[] }[] }>(en: T, de: T): T {
  const text = new Map(de.categories.flatMap(c => c.items).map(i => [i.name, i]))
  return {
    ...en,
    categories: en.categories.map((c, n) => ({
      ...c,
      category: de.categories[n]?.category ?? c.category,
      items: c.items.map(i => ({ ...i, what: text.get(i.name)?.what ?? i.what, why: text.get(i.name)?.why ?? i.why })),
    })),
  }
}

export async function useSiteContent() {
  const { locale } = useI18n()
  const { data } = await useAsyncData('site-content', async () => {
    const [rawProjects, posts, timeline, skills, profile, projectsDe, timelineDe, skillsDe, profileDe] = await Promise.all([
      queryCollection('projects').order('order', 'ASC').all(),
      // only what the list, search and meta tags show: each post slide loads its own body
      queryCollection('posts').where('draft', '=', false).order('date', 'DESC').select('path', 'title', 'summary', 'date', 'tags').all(),
      queryCollection('timeline').first(),
      queryCollection('skills').first(),
      queryCollection('profile').first(),
      queryCollection('projects_de').all(),
      queryCollection('timeline_de').first(),
      queryCollection('skills_de').first(),
      queryCollection('profile_de').first(),
    ])
    const projects = rawProjects.map(withLiveStats)
    const deBy = new Map(projectsDe.map(x => [baseName(x.stem), x]))
    const profileOverrides = profileDe
      ? Object.fromEntries(Object.entries(profileDe).filter(([k, v]) => v != null && ['role', 'location', 'lookingFor', 'pitch', 'cvNote'].includes(k)))
      : {}
    return {
      en: { projects, posts, timeline, skills, profile },
      de: {
        projects: projects.map(p => localizeProject(p, deBy.get(baseName(p.stem)))),
        posts,
        timeline: timelineDe ?? timeline,
        skills: skills && skillsDe ? localizeSkills(skills, skillsDe) : skills,
        profile: profile ? { ...profile, ...profileOverrides } : profile,
      },
    }
  })

  const current = computed(() => (locale.value === 'de' ? data.value?.de : data.value?.en))
  const projects = computed(() => current.value?.projects ?? [])
  const project = (slug: string) => projects.value.find(p => p.stem.endsWith(`/${slug}`))
  const byTier = (tier: 'flagship' | 'featured' | 'more') => projects.value.filter(p => p.tier === tier)

  return {
    projects,
    project,
    byTier,
    posts: computed(() => current.value?.posts ?? []),
    timeline: computed(() => current.value?.timeline?.entries ?? []),
    skills: computed(() => current.value?.skills?.categories ?? []),
    profile: computed(() => current.value?.profile ?? null),
  }
}

export function ageFrom(birth: { year: number, month: number }, now = new Date()) {
  let age = now.getFullYear() - birth.year
  if (now.getMonth() + 1 < birth.month) age--
  return age
}

const MONTHS: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  de: ['Jän.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
}

/** Not the browser's Intl, so the server render and the browser always agree. */
export function formatDate(iso: string, withDay = true, lang = 'en') {
  const [y, m, d] = iso.split('-').map(Number)
  const month = (MONTHS[lang] ?? MONTHS.en!)[(m ?? 1) - 1]
  if (lang === 'de') return withDay ? `${d}. ${month} ${y}` : `${month} ${y}`
  return withDay ? `${d} ${month} ${y}` : `${month} ${y}`
}
