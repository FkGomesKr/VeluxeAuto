export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'pt', name: 'Português', file: 'pt.js' },
      { code: 'es', name: 'Español', file: 'es.js' },
      { code: 'en', name: 'English', file: 'en.js' },
      { code: 'fr', name: 'Français', file: 'fr.js' },
      { code: 'de', name: 'Deutsch', file: 'de.js' },
      { code: 'it', name: 'Italiano', file: 'it.js' },
      { code: 'zh-CN', name: '中国人', file: 'zh-CN.js' }
    ],
    lazy: true, 
    langDir: 'lang',
    defaultLocale: 'pt',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    compilation: {
      strictMessage: false,
    },
    vueI18n: './i18n.config.ts',
  },
  css: [
    '@fontsource-variable/nunito-sans',
    '@/assets/css/tailwind.css',
    '@fortawesome/fontawesome-free/css/all.css'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  	
  runtimeConfig: {
    // Private keys (server-side only - never exposed to client)
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || 'car-images',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CACHE_CLEAR_KEY: process.env.CACHE_CLEAR_KEY,
  },

  // Vercel/server edge caching: Cache-Control so responses are cached and we spare DB + Supabase
  nitro: {
    routeRules: {
      // Cars API: edge cache JSON (data changes rarely, same as images)
      '/api/cars': {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=21600',
        },
      },
      '/api/cars/**': {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        },
      },
      // Build outputs: immutable, long cache (content-hashed filenames)
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
      // Static images/SVGs in public/ (e.g. /images/VeluxeAutoLogo.png or /public/images/...)
      '/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000',
        },
      },
      '/public/images/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000',
        },
      },
    },
  },

  components: true,
  compatibilityDate: '2026-02-08',

  // Pre-bundle noUiSlider in dev so the first import resolves quickly (Hero + stock sliders)
  vite: {
    optimizeDeps: {
      include: ['nouislider'],
    },
  },
})
