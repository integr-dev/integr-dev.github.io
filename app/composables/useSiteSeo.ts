export const SITE_URL = 'https://integr.is-a.dev'
export const OG_IMAGE = `${SITE_URL}/og.png`

type Profile = NonNullable<Awaited<ReturnType<typeof useSiteContent>>['profile']['value']>

/** The person behind the site, as schema.org data. Shared by the home page and every post. */
export function personSchema(profile: Profile, skills: string[] = []) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    'name': profile.fullName,
    'givenName': profile.name,
    'familyName': profile.fullName.replace(profile.name, '').trim(),
    // every name people might search for: the handle and both GitHub usernames
    'alternateName': [...new Set([profile.handle, ...profile.links.filter(l => l.icon === 'github').map(l => l.label)])],
    'url': SITE_URL,
    'image': `${SITE_URL}/logo.png`,
    'jobTitle': profile.role,
    'description': profile.pitch,
    'email': `mailto:${profile.email}`,
    'address': { '@type': 'PostalAddress', 'addressCountry': 'AT' },
    'sameAs': profile.links.map(l => l.href),
    ...(skills.length ? { knowsAbout: skills } : {}),
  }
}

export function jsonLd(data: object) {
  return {
    type: 'application/ld+json' as const,
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', ...data }),
  }
}

type SiteContent = Awaited<ReturnType<typeof useSiteContent>>
type DeckNav = ReturnType<typeof import('~/deck/useDeckNav')['useDeckNav']>

const LANGUAGES = ['Kotlin', 'Java', 'TypeScript', 'Python', 'Go', 'Swift']

interface PageMeta {
  title: string
  description: string
  image: string
  type: 'profile' | 'website' | 'article'
  published?: string
  tags?: string[]
  /** schema.org nodes for this position, besides the person and the website */
  nodes: object[]
}

/**
 * Title, description, canonical URL, social cards and structured data for the deck position
 * the page is on. Every path is its own prerendered page, so each gets its own metadata; it
 * follows along when the deck moves. Synchronous on purpose: the page awaits the content in
 * its own setup and passes it in, because Nuxt composables called after an await inside
 * another async function lose their context.
 */
export function useDeckSeo({ profile, skills, projects, posts }: SiteContent, nav: DeckNav) {
  const p = profile.value
  if (!p) return

  const person = personSchema(p, skills.value.flatMap(c => c.items))
  const personRef = { '@id': `${SITE_URL}/#person` }
  const url = computed(() => `${SITE_URL}${nav.path.value === '/' ? '/' : nav.path.value}`)
  const flagships = projects.value.filter(x => x.tier === 'flagship')

  const meta = computed<PageMeta>(() => {
    const sheet = nav.sheet.value
    const slide = nav.slideId.value
    const project = projects.value.find(x => x.stem.endsWith(`/${sheet.id}`))

    if (project && project.tier === 'flagship') {
      const readme = slide === 'readme'
      const repo = project.links.find(l => l.href.startsWith('https://github.com/'))?.href
      const image = `${SITE_URL}/og/projects/${sheet.id}.png`
      return {
        title: `${project.title}${readme ? ' readme' : ''} · ${p.fullName}`,
        description: project.tagline,
        image,
        type: 'website',
        nodes: [{
          '@type': 'SoftwareSourceCode',
          'name': project.title,
          'description': project.tagline,
          'url': url.value,
          'image': image,
          ...(repo ? { codeRepository: repo } : {}),
          'programmingLanguage': project.stack.filter(t => LANGUAGES.includes(t)),
          'keywords': project.stack.join(', '),
          'author': personRef,
        }],
      }
    }

    if (sheet.id === 'posts' && slide && slide !== 'list') {
      const post = posts.value.find(x => x.path === `/posts/${slide}`)
      if (post) {
        const image = `${SITE_URL}/og/posts/${slide}.png`
        return {
          title: `${post.title} · ${p.fullName}`,
          description: post.summary,
          image,
          type: 'article',
          published: post.date,
          tags: post.tags,
          nodes: [{
            '@type': 'BlogPosting',
            'headline': post.title,
            'description': post.summary,
            'datePublished': new Date(post.date).toISOString(),
            'url': url.value,
            'mainEntityOfPage': url.value,
            'image': image,
            'keywords': post.tags?.join(', '),
            'author': personRef,
          }],
        }
      }
    }

    if (nav.x.value === 0) {
      // name first and nothing before it: the page should answer a search for the name
      const title = `${p.fullName} · ${p.role} from ${p.location}`
      // kept under ~155 characters, the length Google shows in results
      const description = `${p.fullName} (${p.handle}), ${p.role.toLowerCase()} from ${p.location}, mostly Kotlin. Projects: ${flagships.map(x => x.title).join(', ')}.`
      return {
        title,
        description,
        image: OG_IMAGE,
        type: 'profile',
        nodes: [
          {
            '@type': 'ProfilePage',
            '@id': `${SITE_URL}/#page`,
            'url': `${SITE_URL}/`,
            'name': title,
            'description': description,
            'inLanguage': 'en',
            'dateModified': new Date().toISOString(),
            'isPartOf': { '@id': `${SITE_URL}/#website` },
            'mainEntity': personRef,
          },
          // the projects on the page, as code their author wrote
          ...projects.value.filter(x => x.tier !== 'more').map((x) => {
            const repo = x.links.find(l => l.href.startsWith('https://github.com/'))?.href
            return {
              '@type': 'SoftwareSourceCode',
              'name': x.title,
              'description': x.tagline,
              ...(repo ? { codeRepository: repo } : {}),
              'programmingLanguage': x.stack.filter(t => LANGUAGES.includes(t)),
              'author': personRef,
            }
          }),
        ],
      }
    }

    const descriptions: Record<string, string> = {
      projects: `More projects by ${p.fullName}: ${projects.value.filter(x => x.tier === 'featured').map(x => x.title).join(', ')}.`,
      posts: `Notes by ${p.fullName} on the projects: how they work and why they are built that way.`,
      timeline: `What ${p.fullName} has built, year by year.`,
      skills: `Languages, frameworks and tools ${p.fullName} works with.`,
      contact: `How to reach ${p.fullName}, ${p.role.toLowerCase()} from ${p.location}.`,
    }
    const more = sheet.id === 'projects' && slide === 'more'
    return {
      title: `${more ? 'More projects' : sheet.title} · ${p.fullName}`,
      description: more ? `Libraries and older experiments by ${p.fullName}.` : (descriptions[sheet.id] ?? p.pitch),
      image: OG_IMAGE,
      type: 'website',
      nodes: [],
    }
  })

  useSeoMeta({
    title: () => meta.value.title,
    description: () => meta.value.description,
    author: p.fullName,
    ogType: () => meta.value.type,
    ogTitle: () => meta.value.title,
    ogDescription: () => meta.value.description,
    ogUrl: () => url.value,
    ogImage: () => meta.value.image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => meta.value.title,
    ogSiteName: p.fullName,
    ogLocale: 'en_US',
    profileFirstName: p.name,
    profileLastName: p.fullName.replace(p.name, '').trim(),
    profileUsername: p.handle,
    articlePublishedTime: () => meta.value.published,
    articleTag: () => meta.value.tags,
    twitterCard: 'summary_large_image',
    twitterTitle: () => meta.value.title,
    twitterDescription: () => meta.value.description,
    twitterImage: () => meta.value.image,
  })

  useHead({
    link: () => [
      { rel: 'canonical', href: url.value },
      // rel=me ties the profiles elsewhere to this page as the same person
      ...p.links.map(l => ({ rel: 'me' as const, href: l.href })),
    ],
    script: () => [
      jsonLd({
        '@graph': [
          ...meta.value.nodes,
          person,
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            'url': SITE_URL,
            'name': p.fullName,
            'alternateName': p.handle,
            'publisher': personRef,
          },
        ],
      }),
    ],
  })
}
