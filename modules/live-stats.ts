import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { addTemplate, addTypeTemplate, defineNuxtModule } from 'nuxt/kit'
import { parseFrontMatter } from 'remark-mdc'

/**
 * Live project numbers. A stats item (or a badge) in a project's frontmatter can name where its
 * number comes from with `live`; the production build fetches it and useSiteContent lays it over
 * the number in the file. What fails keeps the file's numbers and date, so a build never breaks
 * over it. The Worker rebuilds the site once a day (server/plugins/daily-rebuild.ts).
 *
 *   github:commits:<owner>/<repo>          commits on the default branch
 *   github:commits:<owner>/*               summed over the owner's repositories
 *   github:stars:<owner>/<repo>|<owner>/*  stars
 *   github:repos:<owner>                   public repositories (without .github)
 *   github:contributors:<owner>/<repo>     people who committed
 *   github:commits-by:<owner>/<repo>@<login>  commits by one person
 *   modrinth:downloads:<slug>, modrinth:followers:<slug>
 *
 * A badge shows its number rounded down to the hundred, with a "+".
 */

export interface LiveProject {
  asOf: string
  items: Record<string, string>
  badge?: string
}

type Json = Record<string, any>

export default defineNuxtModule({
  meta: { name: 'live-stats' },
  setup(_, nuxt) {
    const dir = join(nuxt.options.rootDir, 'content/en/projects')
    // only the production build asks the APIs; in dev the files' numbers show (LIVE_STATS=1 to try)
    // (not while only preparing types)
    const enabled = (!nuxt.options.dev && !nuxt.options._prepare) || process.env.LIVE_STATS === '1'

    addTemplate({
      filename: 'live-stats.mjs',
      getContents: async () => `export default ${JSON.stringify(enabled ? await collect(dir) : {})}`,
    })
    addTypeTemplate({
      filename: 'types/live-stats.d.ts',
      getContents: () => `declare module '#build/live-stats.mjs' {
  const stats: Record<string, import('${join(nuxt.options.rootDir, 'modules/live-stats')}').LiveProject>
  export default stats
}`,
    })
  },
})

async function collect(dir: string): Promise<Record<string, LiveProject>> {
  const out: Record<string, LiveProject> = {}
  const today = new Date().toISOString().slice(0, 10)
  for (const file of (await readdir(dir)).filter((f: string) => f.endsWith('.md'))) {
    const { data } = parseFrontMatter(await readFile(join(dir, file), 'utf8'))
    const items = ((data.stats?.items ?? []) as { label: string, live?: string }[]).filter(i => i.live)
    const badge = data.badge?.live as string | undefined
    if (!items.length && !badge) continue
    try {
      const project: LiveProject = { asOf: today, items: {} }
      for (const item of items) project.items[item.label] = format(await value(item.live!))
      if (badge) project.badge = `${format(Math.floor(await value(badge) / 100) * 100)}+`
      out[file.slice(0, -3)] = project
    }
    catch (e) {
      console.warn(`[live-stats] ${file}: keeping the numbers in the file (${(e as Error).message})`)
    }
  }
  return out
}

const format = (n: number) => n.toLocaleString('en-US')

const cache = new Map<string, Promise<any>>()

function get(url: string, headers: Record<string, string> = {}) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url, { headers: { 'user-agent': 'integr.cc live-stats', ...headers } }).then(async (res) => {
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      return { body: await res.json(), link: res.headers.get('link') ?? '' }
    }))
  }
  return cache.get(url)!
}

// optional GITHUB_TOKEN (a build variable): the API allows only 60 requests an hour without one
function github(path: string) {
  const token = process.env.GITHUB_TOKEN
  return get(`https://api.github.com/${path}`, {
    accept: 'application/vnd.github+json',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  })
}

/** How many items a list has, read from the last page's number with one item per page. */
async function count(path: string) {
  const { body, link } = await github(`${path}${path.includes('?') ? '&' : '?'}per_page=1`)
  const last = /[?&]page=(\d+)>; rel="last"/.exec(link)
  return last ? Number(last[1]) : (body as unknown[]).length
}

async function repos(owner: string) {
  const { body } = await github(`users/${owner}/repos?per_page=100&type=owner`)
  return (body as Json[]).filter(r => r.name !== '.github' && !r.fork)
}

async function perRepo(target: string, one: (repo: string) => Promise<number>) {
  const [owner, repo] = target.split('/')
  if (repo !== '*') return one(target)
  const all = await Promise.all((await repos(owner!)).map(r => one(r.full_name)))
  return all.reduce((a, b) => a + b, 0)
}

async function value(spec: string): Promise<number> {
  const [source, kind, target = ''] = spec.split(':')
  if (source === 'modrinth') {
    const { body } = await get(`https://api.modrinth.com/v2/project/${target}`)
    if (kind === 'downloads' || kind === 'followers') return (body as Json)[kind]
  }
  if (source === 'github') {
    switch (kind) {
      case 'commits': return perRepo(target, r => count(`repos/${r}/commits`))
      case 'stars': return perRepo(target, async r => (await github(`repos/${r}`)).body.stargazers_count)
      case 'repos': return (await repos(target)).length
      case 'contributors': return count(`repos/${target}/contributors`)
      case 'commits-by': {
        const [repo, login] = target.split('@')
        const { body } = await github(`repos/${repo}/contributors?per_page=100`)
        return (body as Json[]).find(c => c.login === login)?.contributions ?? 0
      }
    }
  }
  throw new Error(`unknown source "${spec}"`)
}
