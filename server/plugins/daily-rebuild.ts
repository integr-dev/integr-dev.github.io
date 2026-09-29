// Once a day (the cron trigger in nuxt.config) the Worker calls the build's Deploy Hook, so the site
// is rebuilt with fresh project numbers (modules/live-stats.ts). DEPLOY_HOOK_URL is a secret on the
// Worker; without it nothing happens.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:scheduled' as any, ({ env, context }: { env: Record<string, unknown>, context: { waitUntil: (p: Promise<unknown>) => void } }) => {
    const url = env.DEPLOY_HOOK_URL
    if (typeof url === 'string') context.waitUntil(fetch(url, { method: 'POST' }))
  })
})
