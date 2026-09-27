import { queryCollection } from '@nuxt/content/server'
import { staticPaths } from '../../app/deck/paths'

const SITE_URL = 'https://integr.is-a.dev'

// Prerendered at build time (nuxt.config nitro.prerender): every deck position is its own page,
// plus one per published post.
export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts').where('draft', '=', false).order('date', 'DESC').all()
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...staticPaths().map(p => ({ loc: `${SITE_URL}${p}`, lastmod: today, priority: p === '/' ? '1.0' : p.split('/').length > 2 ? '0.7' : '0.8' })),
    ...posts.map(p => ({ loc: `${SITE_URL}${p.path}`, lastmod: p.date, priority: '0.6' })),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`
})
