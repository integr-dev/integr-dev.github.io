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

/**
 * Title, description, canonical URL, social cards and structured data for the home page.
 * Synchronous on purpose: the page awaits the content in its own setup and passes it in, because
 * Nuxt composables called after an await inside another async function lose their context.
 */
export function useHomeSeo({ profile, skills, projects }: SiteContent) {
  const p = profile.value
  if (!p) return

  const flagships = projects.value.filter(x => x.tier === 'flagship').map(x => x.title)
  // name first and nothing before it: the page should answer a search for the name
  const title = `${p.fullName} · ${p.role} from ${p.location}`
  // kept under ~155 characters, the length Google shows in results
  const description = `${p.fullName} (${p.handle}), ${p.role.toLowerCase()} from ${p.location}, mostly Kotlin. Projects: ${flagships.join(', ')}.`

  useSeoMeta({
    title,
    description,
    author: p.fullName,
    ogType: 'profile',
    ogTitle: title,
    ogDescription: description,
    ogUrl: SITE_URL,
    ogImage: OG_IMAGE,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: `${p.fullName}, ${p.role} from ${p.location}`,
    ogSiteName: p.fullName,
    ogLocale: 'en_US',
    profileFirstName: p.name,
    profileLastName: p.fullName.replace(p.name, '').trim(),
    profileUsername: p.handle,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: OG_IMAGE,
  })

  // the projects on the page, as code their author wrote
  const code = projects.value
    .filter(x => x.tier !== 'more')
    .map((x) => {
      const repo = x.links.find(l => l.href.startsWith('https://github.com/'))?.href
      return {
        '@type': 'SoftwareSourceCode',
        'name': x.title,
        'description': x.tagline,
        ...(repo ? { codeRepository: repo } : {}),
        'programmingLanguage': x.stack.filter(t => ['Kotlin', 'Java', 'TypeScript', 'Python', 'Go', 'Swift'].includes(t)),
        'author': { '@id': `${SITE_URL}/#person` },
      }
    })

  useHead({
    link: [
      { rel: 'canonical', href: `${SITE_URL}/` },
      // rel=me ties the profiles elsewhere to this page as the same person
      ...p.links.map(l => ({ rel: 'me' as const, href: l.href })),
    ],
    script: [
      jsonLd({
        '@graph': [
          {
            '@type': 'ProfilePage',
            '@id': `${SITE_URL}/#page`,
            'url': SITE_URL,
            'name': title,
            'description': description,
            'inLanguage': 'en',
            'dateModified': new Date().toISOString(),
            'isPartOf': { '@id': `${SITE_URL}/#website` },
            'mainEntity': { '@id': `${SITE_URL}/#person` },
          },
          personSchema(p, skills.value.flatMap(c => c.items)),
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            'url': SITE_URL,
            'name': p.fullName,
            'alternateName': p.handle,
            'publisher': { '@id': `${SITE_URL}/#person` },
          },
          ...code,
        ],
      }),
    ],
  })
}
