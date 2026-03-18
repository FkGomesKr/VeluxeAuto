import { CarsService } from '~/server/services/cars.service'

/**
 * Get all cars endpoint
 * GET /api/cars
 * Returns cars with Portuguese field names for frontend compatibility
 * 
 * Cached for 6 hours to reduce database load (data changes are very rare)
 * Cache key includes expiresIn query param to ensure different presigned URL expiry times are cached separately
 */
export default defineCachedEventHandler(async () => {
  try {
    const carsService = new CarsService()
    const cars = await carsService.getAllCars()

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
}, {
  maxAge: 6 * 60 * 60, // Cache for 6 hours - data changes are very rare
  name: 'cars-list',
  getKey: () => 'cars-list',
  swr: true,
})
