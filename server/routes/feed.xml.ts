import { queryCollection } from '@nuxt/content/server'

const SITE_URL = 'https://integr.is-a.dev'

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// RSS 2.0 feed of the published posts, prerendered at build time (nuxt.config nitro.prerender).
export default defineEventHandler(async (event) => {
  const [posts, profile] = await Promise.all([
    queryCollection(event, 'posts').where('draft', '=', false).order('date', 'DESC').all(),
    queryCollection(event, 'profile').first(),
  ])
  const name = profile?.fullName ?? 'Erik Reitbauer'
  const items = posts.map((p) => {
    const url = `${SITE_URL}${p.path}`
    return `    <item>
      <title>${escape(p.title ?? '')}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escape(p.summary)}</description>
${(p.tags ?? []).map(t => `      <category>${escape(t)}</category>`).join('\n')}
    </item>`
  })
  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(name)} · Posts</title>
    <link>${SITE_URL}/</link>
    <description>Notes on the projects of ${escape(name)} (integr).</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>\n` : ''}${items.join('\n')}
  </channel>
</rss>
`
})
