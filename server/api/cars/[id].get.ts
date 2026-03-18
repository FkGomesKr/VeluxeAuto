import { CarsService } from '~/server/services/cars.service'

/**
 * Get car by ID endpoint
 * GET /api/cars/:id
 * Returns car with Portuguese field names for frontend compatibility
 * 
 * Cached for 24 hours to reduce database load (data changes are very rare)
 * Cache key includes car ID and expiresIn query param
 */
export default defineCachedEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car ID is required'
      })
    }
    
    const carId = parseInt(id)
    if (isNaN(carId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid car ID'
      })
    }
    
    const carsService = new CarsService()
    const car = await carsService.getCarById(carId)
    
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }
    
    return {
      success: true,
      car
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch car'
    })
  }
}, {
  maxAge: 24 * 60 * 60, // Cache for 24 hours (86400 seconds) - individual car data changes very rarely
  name: 'car-detail',
  getKey: (event) => `car-${getRouterParam(event, 'id')}`,
  swr: true, // Enable stale-while-revalidate: serve stale cache while revalidating in background
})
