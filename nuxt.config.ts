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
    vueI18n: './i18n.config.ts',
  },
  css: [
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
  },
  
  components: true,
  compatibilityDate: '2026-02-08',
})
