export async function useSiteContent() {
  const { data } = await useAsyncData('site-content', async () => {
    const [projects, posts, timeline, skills, profile] = await Promise.all([
      queryCollection('projects').order('order', 'ASC').all(),
      queryCollection('posts').where('draft', '=', false).order('date', 'DESC').all(),
      queryCollection('timeline').first(),
      queryCollection('skills').first(),
      queryCollection('profile').first(),
    ])
    return { projects, posts, timeline, skills, profile }
  })

  const projects = computed(() => data.value?.projects ?? [])
  const project = (slug: string) => projects.value.find(p => p.stem.endsWith(`/${slug}`))
  const byTier = (tier: 'flagship' | 'featured' | 'more') => projects.value.filter(p => p.tier === tier)

  return {
    projects,
    project,
    byTier,
    posts: computed(() => data.value?.posts ?? []),
    timeline: computed(() => data.value?.timeline?.entries ?? []),
    skills: computed(() => data.value?.skills?.categories ?? []),
    profile: computed(() => data.value?.profile ?? null),
  }
}

export function ageFrom(birth: { year: number, month: number }, now = new Date()) {
  let age = now.getFullYear() - birth.year
  if (now.getMonth() + 1 < birth.month) age--
  return age
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Locale independent, so the server render and the browser always agree. */
export function formatDate(iso: string, withDay = true) {
  const [y, m, d] = iso.split('-').map(Number)
  const month = MONTHS[(m ?? 1) - 1]
  return withDay ? `${d} ${month} ${y}` : `${month} ${y}`
}
