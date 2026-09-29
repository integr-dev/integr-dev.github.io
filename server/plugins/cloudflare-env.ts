// On Cloudflare the Worker's variables and secrets arrive with each request as bindings, not in
// process.env. Nuxt Studio reads its login settings (STUDIO_GITHUB_*) and Nuxt its runtime config
// overrides (NUXT_*) from process.env, so the text bindings are copied there first.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const env = (event.context.cloudflare?.env ?? (globalThis as { __env__?: unknown }).__env__) as Record<string, unknown> | undefined
    const target = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env
    if (!env || !target) return
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'string') target[key] = value
    }
  })
})
