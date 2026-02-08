import { CarsService } from '~/server/services/cars.service'

/**
 * Get car by ID endpoint
 * GET /api/cars/:id
 * Returns car with Portuguese field names for frontend compatibility
 */
export default defineEventHandler(async (event) => {
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
    
    const query = getQuery(event)
    const expiresIn = query.expiresIn ? parseInt(query.expiresIn as string) : 3600 * 24 * 7 // 7 days default
    
    const carsService = new CarsService()
    const car = await carsService.getCarById(carId, expiresIn)
    
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
})
