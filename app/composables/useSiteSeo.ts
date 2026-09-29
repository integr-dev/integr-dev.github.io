export const SITE_URL = 'https://integr.cc'

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
  // name, handle and links are the same in every language; the rest follows the language
  const base = profile.value
  if (!base) return

  const { t, locale } = useI18n()
  const isDe = computed(() => locale.value === 'de')
  const person = computed(() => personSchema(profile.value ?? base, skills.value.flatMap(c => c.items.map(i => i.name))))
  const personRef = { '@id': `${SITE_URL}/#person` }
  const urlFor = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`
  const url = computed(() => urlFor(nav.localPath.value))

  const meta = computed<PageMeta>(() => {
    const p = profile.value ?? base
    const de = isDe.value
    // English roles read as common nouns in running text ("software developer"); German keeps its capital
    const role = de ? p.role : p.role.toLowerCase()
    const flagships = projects.value.filter(x => x.tier === 'flagship')
    const sheet = nav.sheet.value
    const slide = nav.slideId.value
    const project = projects.value.find(x => x.stem.endsWith(`/${sheet.id}`))
    // social cards in the page language (scripts/og.py): /og.png and /og/..., German under /og/de
    const card = (path: string) => `${SITE_URL}/og${de ? '/de' : ''}${path}`
    const homeCard = de ? `${SITE_URL}/og/de.png` : `${SITE_URL}/og.png`

    if (project && project.tier === 'flagship') {
      const readme = slide === 'readme'
      const repo = project.links.find(l => l.href.startsWith('https://github.com/'))?.href
      const image = card(`/projects/${sheet.id}.png`)
      return {
        title: `${readme ? t('seo.readme', { project: project.title }) : project.title} · ${p.fullName}`,
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
        const image = card(`/posts/${slide}.png`)
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
      const title = t('seo.title', { name: p.fullName, role: p.role, location: p.location })
      // kept under ~155 characters, the length Google shows in results
      const description = t('seo.description', { name: p.fullName, handle: p.handle, role, location: p.location, projects: flagships.map(x => x.title).join(', ') })
      return {
        title,
        description,
        image: homeCard,
        type: 'profile',
        nodes: [
          {
            '@type': 'ProfilePage',
            '@id': `${SITE_URL}/#page`,
            'url': `${SITE_URL}/`,
            'name': title,
            'description': description,
            'inLanguage': de ? 'de-AT' : 'en',
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
      projects: t('seo.projects', { name: p.fullName, projects: projects.value.filter(x => x.tier === 'featured').map(x => x.title).join(', ') }),
      posts: t('seo.posts', { name: p.fullName }),
      timeline: t('seo.timeline', { name: p.fullName }),
      skills: t('seo.skills', { name: p.fullName }),
      contact: t('seo.contact', { name: p.fullName, role, location: p.location }),
    }
    const more = sheet.id === 'projects' && slide === 'more'
    return {
      title: `${more ? t('seo.moreTitle') : t(`sheets.${sheet.id}`)} · ${p.fullName}`,
      description: more ? t('seo.more', { name: p.fullName }) : (descriptions[sheet.id] ?? p.pitch),
      image: homeCard,
      type: 'website',
      nodes: [],
    }
  })

  useSeoMeta({
    title: () => meta.value.title,
    description: () => meta.value.description,
    author: base.fullName,
    ogType: () => meta.value.type,
    ogTitle: () => meta.value.title,
    ogDescription: () => meta.value.description,
    ogUrl: () => url.value,
    ogImage: () => meta.value.image,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => meta.value.title,
    ogSiteName: base.fullName,
    ogLocale: () => (isDe.value ? 'de_AT' : 'en_US'),
    ogLocaleAlternate: () => (isDe.value ? ['en_US'] : ['de_AT']),
    profileFirstName: base.name,
    profileLastName: base.fullName.replace(base.name, '').trim(),
    profileUsername: base.handle,
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
      // the same position in the other language
      { rel: 'alternate', hreflang: 'en', href: urlFor(nav.path.value) },
      { rel: 'alternate', hreflang: 'de-AT', href: urlFor(nav.path.value === '/' ? '/de' : `/de${nav.path.value}`) },
      { rel: 'alternate', hreflang: 'x-default', href: urlFor(nav.path.value) },
      // rel=me ties the profiles elsewhere to this page as the same person
      ...base.links.map(l => ({ rel: 'me' as const, href: l.href })),
    ],
    script: () => [
      jsonLd({
        '@graph': [
          ...meta.value.nodes,
          person.value,
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            // Google takes the site name shown above the URL in results from this node on the home
            // page; the url has to match the home page's canonical URL exactly (with the slash)
            'url': `${SITE_URL}/`,
            'name': base.fullName,
            'alternateName': [base.handle, new URL(SITE_URL).host],
            'publisher': personRef,
          },
        ],
      }),
    ],
  })
}
