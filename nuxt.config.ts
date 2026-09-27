import { staticPaths } from './app/deck/paths'

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
        // one plain theme-color: Discord colours the embed rail with it and ignores
        // media-scoped (light/dark) variants
        { name: 'theme-color', content: '#80B55F' },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { name: 'google-site-verification', content: 'UqFlowAj-jpBkiNTFlVk9K2h6Udzl4luSeYDUNVqZuI' },
      ],
      script: [
        // Marks JS as available before first paint, so draw-in styles only hide things when they can
        // be revealed. Set here rather than in app.vue: the error page (404) replaces app.vue.
        { innerHTML: 'document.documentElement.classList.add(\'js\')', tagPosition: 'head' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Erik Reitbauer · Posts', href: '/feed.xml' },
      ],
    },
  },

  nitro: {
    prerender: {
      // every deck position is its own page; the post pages are found by crawling the post list
      crawlLinks: true,
      routes: [...staticPaths(), '/sitemap.xml', '/feed.xml'],
      // /posts.html instead of /posts/index.html: GitHub Pages serves both without a trailing
      // slash redirect, so the URLs stay exactly the canonical ones
      autoSubfolderIndex: false,
    },
  },
})
