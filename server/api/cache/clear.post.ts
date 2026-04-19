import { triggerCacheBust } from '~/server/utils/cache-bust'

/**
 * Clear API response cache endpoint
 * POST /api/cache/clear
 * 
 * Protected by CACHE_CLEAR_KEY. Call from Postman:
 *   POST https://yourdomain.com/api/cache/clear
 *   Header: x-cache-key: <your-secret>
 * 
 * After calling, car endpoints will return no-cache headers for 30 seconds,
 * forcing Vercel's edge to fetch fresh data from the database.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = config.CACHE_CLEAR_KEY as string | undefined

  if (!secret) {
    throw createError({ statusCode: 503, statusMessage: 'Cache clear is not configured' })
  }

  const provided = getRequestHeader(event, 'x-cache-key')

  if (!provided || provided !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  triggerCacheBust()

  return {
    success: true,
    message: 'Cache busted. Requests in the next 30 seconds will bypass edge cache and fetch fresh data.',
  }
})
