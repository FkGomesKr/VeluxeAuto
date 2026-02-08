import { CarsService } from '~/server/services/cars.service'

/**
 * Get all cars endpoint
 * GET /api/cars
 * Returns cars with Portuguese field names for frontend compatibility
 */
export default defineEventHandler(async (event) => {
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
})
