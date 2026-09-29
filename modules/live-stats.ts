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
 *
 * Also from the build (#build/build-info.mjs): when the site was built, and the newest public push
 * of ACCOUNTS (the intro's "currently" line).
 */

const ACCOUNTS = ['integr-dev', 'e-reitbauer']
// the site itself is pushed to all the time (Studio, deploys); it would always be the newest
const NOT_CURRENT = ['integr-dev/portfolio']

export interface BuildInfo {
  /** ISO time of the build (in dev: of the dev server's start) */
  builtAt: string
  /** the newest public push over ACCOUNTS */
  latestPush: { repo: string, url: string, at: string } | null
}

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
    const builtAt = new Date().toISOString()
    addTemplate({
      filename: 'build-info.mjs',
      // the one push lookup also runs in dev, so the intro line can be seen there
      getContents: async () => `export default ${JSON.stringify({ builtAt, latestPush: nuxt.options._prepare ? null : await latestPush() } satisfies BuildInfo)}`,
    })
    addTypeTemplate({
      filename: 'types/build-info.d.ts',
      getContents: () => `declare module '#build/build-info.mjs' {
  const info: import('${join(nuxt.options.rootDir, 'modules/live-stats')}').BuildInfo
  export default info
}`,
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

async function latestPush(): Promise<BuildInfo['latestPush']> {
  try {
    const pushes = (await Promise.all(ACCOUNTS.map(async a => (await github(`users/${a}/events/public?per_page=100`)).body as Json[])))
      .flat()
      .filter(e => e.type === 'PushEvent' && !NOT_CURRENT.includes(e.repo.name))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const push = pushes[0]
    return push ? { repo: push.repo.name.split('/')[1], url: `https://github.com/${push.repo.name}`, at: push.created_at } : null
  }
  catch (e) {
    console.warn(`[live-stats] latest push: none shown (${(e as Error).message})`)
    return null
  }
}

const cache = new Map<string, Promise<any>>()

class HttpError extends Error {
  constructor(readonly status: number, url: string) {
    super(`${status} ${url}`)
  }
}

function get(url: string, headers: Record<string, string> = {}, key = url) {
  if (!cache.has(key)) {
    cache.set(key, fetch(url, { headers: { 'user-agent': 'integr.cc live-stats', ...headers } }).then(async (res) => {
      if (!res.ok) throw new HttpError(res.status, url)
      return { body: await res.json(), link: res.headers.get('link') ?? '' }
    }))
  }
  return cache.get(key)!
}

// optional GITHUB_TOKEN (a build variable): the API allows only 60 requests an hour without one.
// A token GitHub turns down (expired, revoked: 401/403) is dropped for the rest of the build, and
// the requests go on without it.
let tokenRejected = false

async function github(path: string) {
  const url = `https://api.github.com/${path}`
  const accept = { accept: 'application/vnd.github+json' }
  const token = process.env.GITHUB_TOKEN
  if (token && !tokenRejected) {
    try {
      return await get(url, { ...accept, authorization: `Bearer ${token}` })
    }
    catch (e) {
      if (!(e instanceof HttpError) || (e.status !== 401 && e.status !== 403)) throw e
      if (!tokenRejected) console.warn(`[live-stats] GITHUB_TOKEN was turned down (${e.status}), going on without it`)
      tokenRejected = true
    }
  }
  return get(url, accept, `${url} (no token)`)
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
