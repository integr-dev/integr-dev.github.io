import { staticPaths } from './app/deck/paths'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/content', '@nuxt/fonts', '@nuxtjs/i18n'],

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
      // pixel font for the big titles, like the avatar
      { name: 'Jersey 10', provider: 'google', weights: [400] },
    ],
  },

  // English at the plain paths, German under /de (messages in i18n/locales, German content in
  // content/de). No automatic redirect by browser language: the switch is in the title block.
  i18n: {
    baseUrl: 'https://integr.is-a.dev',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'de', language: 'de-AT', name: 'Deutsch', file: 'de.json' },
    ],
    detectBrowserLanguage: false,
  },

  app: {
    head: {
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
        // Before first paint: marks JS as available, so draw-in styles only hide things when they
        // can be revealed, and picks light or dark (the saved choice, else the system setting).
        // Set here rather than in app.vue: the error page (404) replaces app.vue.
        {
          innerHTML: `(function(){var d=document.documentElement;d.classList.add('js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t)})()`,
          tagPosition: 'head',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  nitro: {
    prerender: {
      // every deck position is its own page; the post pages are found by crawling the post list
      crawlLinks: true,
      routes: [...staticPaths(), ...staticPaths().map(p => `/de${p === '/' ? '' : p}`), '/sitemap.xml', '/feed.xml'],
      // /posts.html instead of /posts/index.html: GitHub Pages serves both without a trailing
      // slash redirect, so the URLs stay exactly the canonical ones
      autoSubfolderIndex: false,
    },
  },
})
