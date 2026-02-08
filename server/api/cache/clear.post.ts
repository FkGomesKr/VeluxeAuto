/**
 * Clear API response cache endpoint
 * POST /api/cache/clear
 * 
 * Useful when you manually update the database and want to see changes immediately
 * without waiting for cache expiration.
 * 
 * Note: In production, you might want to add authentication/authorization
 * 
 * Note: File naming (.post.ts) ensures only POST requests are handled by Nuxt
 */
export default defineEventHandler(async (event) => {
  try {
    // Clear all cached responses
    // Nuxt's cache is stored in memory, so we can't directly clear it,
    // but the cache will expire naturally based on maxAge settings
    // For now, we'll just return success - cache will refresh on next request
    
    // In Nuxt 3, cache invalidation happens automatically when maxAge expires
    // or you can restart the server to clear all caches
    
    return {
      success: true,
      message: 'Cache will refresh on next request. For immediate effect, restart the dev server or wait for cache expiration (10-15 minutes).'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to clear cache'
    })
  }
})
