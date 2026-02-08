/**
 * Nuxt server plugin that runs migrations on startup
 * This runs once when the server starts
 * Non-blocking - won't prevent server startup if check fails
 */
export default defineNitroPlugin(async (nitroApp) => {
  // Only run in development or if explicitly enabled
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    console.log('🔄 Checking database migrations...')
    
    // Run check asynchronously without blocking server startup
    import('~/server/utils/migrations')
      .then(({ ensureCarsTable }) => ensureCarsTable())
      .catch(() => {
        // Silently fail - server will continue
      })
  }
})
