import { CarsService } from '~/server/services/cars.service'

/**
 * Get all cars endpoint
 * GET /api/cars
 * Returns cars with Portuguese field names for frontend compatibility
 * 
 * Cached for 10 minutes to reduce database load
 * Cache key includes expiresIn query param to ensure different presigned URL expiry times are cached separately
 */
export default defineCachedEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const expiresIn = query.expiresIn ? parseInt(query.expiresIn as string) : 3600 * 24 * 7 // 7 days default
    
    const carsService = new CarsService()
    const cars = await carsService.getAllCars(expiresIn)
    
    return {
      success: true,
      cars
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch cars'
    })
  }
}, {
  maxAge: 10 * 60, // Cache for 10 minutes (600 seconds)
  name: 'cars-list',
  getKey: (event) => {
    const query = getQuery(event)
    const expiresIn = query.expiresIn ? query.expiresIn : 'default'
    return `cars-list-${expiresIn}`
  },
  swr: true, // Enable stale-while-revalidate: serve stale cache while revalidating in background
})
