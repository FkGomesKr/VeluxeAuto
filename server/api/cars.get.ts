import { CarsService } from '~/server/services/cars.service'

const CACHE_MAX_AGE = 6 * 60 * 60 // 6 hours

/**
 * Get all cars endpoint
 * GET /api/cars
 * Returns cars with Portuguese field names for frontend compatibility
 * 
 * Caching is handled via Cache-Control headers (s-maxage for Vercel edge).
 */
export default defineEventHandler(async (event) => {
  try {
    const carsService = new CarsService()
    const cars = await carsService.getAllCars()

    setResponseHeaders(event, {
      'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE}`,
    })

    return {
      success: true,
      cars,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch cars',
    })
  }
})
