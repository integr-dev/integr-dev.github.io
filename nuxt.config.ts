export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/content', '@nuxt/fonts'],

  ssr: true,

  // one shared Font Awesome instance on server and client, so icons render in SSR
  build: {
    transpile: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-brands-svg-icons', '@fortawesome/vue-fontawesome'],
  },

  css: ['@fortawesome/fontawesome-svg-core/styles.css', '~/assets/base.css'],

  content: {
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        highlight: { theme: { default: 'everforest-light', dark: 'everforest-dark' }, langs: ['kotlin', 'ts', 'bash', 'yaml', 'json'] },
      },
    },
  },

  fonts: {
    providers: { bunny: false, fontshare: false, fontsource: false, adobe: false },
    families: [
      { name: 'Schibsted Grotesk', provider: 'google', weights: [400, 500, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700] },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      // per page titles, descriptions and social cards: app/composables/useSiteSeo.ts
      titleTemplate: '%s',
      meta: [
        { name: 'theme-color', content: '#111812', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#F2EDDB', media: '(prefers-color-scheme: light)' },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'google-site-verification', content: 'UqFlowAj-jpBkiNTFlVk9K2h6Udzl4luSeYDUNVqZuI' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/sitemap.xml'] },
  },
})
