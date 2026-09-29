import { staticPaths } from './app/deck/paths'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/content', '@nuxt/fonts', '@nuxtjs/i18n', 'nuxt-studio'],

  ssr: true,

  // no source maps for the Worker: nobody reads them in production, and they slow the build down
  sourcemap: { server: false, client: false },

  // one shared Font Awesome instance on server and client, so icons render in SSR
  build: {
    transpile: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-brands-svg-icons', '@fortawesome/vue-fontawesome'],
  },

  css: ['@fortawesome/fontawesome-svg-core/styles.css', '~/assets/base.css'],

  content: {
    experimental: { sqliteConnector: 'native' },
    // on Cloudflare the content lives in the D1 database bound as DB (nitro.cloudflare below)
    database: { type: 'd1', bindingName: 'DB' },
    build: {
      markdown: {
        highlight: { theme: { default: 'everforest-light', dark: 'everforest-dark' }, langs: ['kotlin', 'ts', 'bash', 'yaml', 'json'] },
      },
    },
  },

  // Nuxt Studio: edit the content in the browser at /admin. In dev it writes straight to the files
  // here; in production publishing commits to the repository.
  studio: {
    route: '/admin',
    repository: {
      provider: 'github',
      owner: 'integr-dev',
      repo: 'portfolio',
      branch: 'master',
      private: false,
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
    baseUrl: 'https://integr.cc',
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
        // Everything wider than a phone is zoomed so the page looks like it does in the reference
        // window (1694 x 971), just bigger or smaller (not below 0.6); browser zoom therefore keeps the
        // same look too. Phones keep their own layout. --vw etc. in base.css divide the zoom back out.
        // With the Nuxt Studio panel open the window counts from its right edge (__stageLeft).
        // Set here rather than in app.vue: the error page (404) replaces app.vue.
        {
          innerHTML: `(function(){var d=document.documentElement;d.classList.add('js');var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t);function z(){var k=innerWidth<768?1:Math.max(0.6,Math.min((innerWidth-(window.__stageLeft||0))/1694,innerHeight/971));d.style.zoom=k;d.style.setProperty('--zoom',k)}z();addEventListener('resize',z)})()`,
          tagPosition: 'head',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  // A Cloudflare Worker: every page is prerendered and served as a static file; the Worker itself only
  // answers what is not (Studio at /admin, its login and API, unknown paths). Deployed by Cloudflare
  // Workers Builds on every push to master (npm run build, then npx wrangler deploy).
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: 'portfolio',
        // keep the variables set in the dashboard when a build deploys
        keep_vars: true,
        // only integr.cc: no second copy of the site on portfolio.<account>.workers.dev
        workers_dev: false,
        preview_urls: false,
        routes: [{ pattern: 'integr.cc', custom_domain: true }],
        // a daily rebuild for fresh project numbers (server/plugins/daily-rebuild.ts)
        triggers: { crons: ['0 4 * * *'] },
        // Cloudflare serves the prerendered pages itself, and 404.html for any path it has no file
        // for, without starting the Worker. The Worker only runs for Nuxt Studio (the editor, its
        // login and API, its service worker) and for Nuxt Content's queries while editing.
        assets: {
          not_found_handling: '404-page',
          run_worker_first: ['/admin', '/__nuxt_studio/*', '/__nuxt_content/*', '/sw.js'],
        },
        d1_databases: [{ binding: 'DB', database_name: 'portfolio', database_id: 'a53ffdd4-ff4e-4ebc-8de2-c94b793abf05' }],
      },
    },
    prerender: {
      // every deck position is its own page; the post pages are found by crawling the post list
      crawlLinks: true,
      routes: [...staticPaths(), ...staticPaths().map(p => `/de${p === '/' ? '' : p}`), '/sitemap.xml', '/feed.xml', '/404.html'],
      // /posts.html instead of /posts/index.html: Cloudflare serves it at /posts without a trailing
      // slash redirect, so the URLs stay exactly the canonical ones
      autoSubfolderIndex: false,
    },
  },
})
