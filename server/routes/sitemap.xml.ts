import { queryCollection } from '@nuxt/content/server'

const SITE_URL = 'https://integr.is-a.dev'

// Prerendered at build time (nuxt.config nitro.prerender): the home page plus every published post.
export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts').where('draft', '=', false).order('date', 'DESC').all()
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today, priority: '1.0' },
    ...posts.map(p => ({ loc: `${SITE_URL}${p.path}`, lastmod: p.date, priority: '0.6' })),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`
})
