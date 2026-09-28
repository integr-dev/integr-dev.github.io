import type { ProjectsCollectionItem as Project, ProjectsDeCollectionItem as ProjectDe } from '@nuxt/content'

const baseName = (stem: string) => stem.split('/').pop()!

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
export async function useSiteContent() {
  const { locale } = useI18n()
  const { data } = await useAsyncData('site-content', async () => {
    const [projects, posts, timeline, skills, profile, projectsDe, timelineDe, skillsDe, profileDe] = await Promise.all([
      queryCollection('projects').order('order', 'ASC').all(),
      queryCollection('posts').where('draft', '=', false).order('date', 'DESC').all(),
      queryCollection('timeline').first(),
      queryCollection('skills').first(),
      queryCollection('profile').first(),
      queryCollection('projects_de').all(),
      queryCollection('timeline_de').first(),
      queryCollection('skills_de').first(),
      queryCollection('profile_de').first(),
    ])
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
        skills: skillsDe ?? skills,
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
