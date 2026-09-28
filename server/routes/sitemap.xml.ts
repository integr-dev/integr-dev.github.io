import { queryCollection } from '@nuxt/content/server'
import { staticPaths, withLocale } from '../../app/deck/paths'

const SITE_URL = 'https://integr.is-a.dev'

// Prerendered at build time (nuxt.config nitro.prerender): every deck position is its own page,
// plus one per published post, each in English and German (/de).
export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts').where('draft', '=', false).order('date', 'DESC').all()
  const today = new Date().toISOString().slice(0, 10)
  const pages = [
    ...staticPaths().map(p => ({ path: p, lastmod: today, priority: p === '/' ? '1.0' : p.split('/').length > 2 ? '0.7' : '0.8' })),
    ...posts.map(p => ({ path: p.path, lastmod: p.date, priority: '0.6' })),
  ]
  const urls = ['en', 'de'].flatMap(lang => pages.map(p => ({ ...p, loc: `${SITE_URL}${withLocale(p.path, lang)}` })))
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`
})
