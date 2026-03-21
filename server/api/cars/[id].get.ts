import { CarsService } from '~/server/services/cars.service'

const CACHE_MAX_AGE = 24 * 60 * 60 // 24 hours

/**
 * Get car by ID endpoint
 * GET /api/cars/:id
 * Returns car with Portuguese field names for frontend compatibility
 * 
 * Caching is handled via Cache-Control headers (s-maxage for Vercel edge).
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
    
    const carsService = new CarsService()
    const car = await carsService.getCarById(carId)
    
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }

    setResponseHeaders(event, {
      'Cache-Control': `public, max-age=300, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE}`,
    })
    
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
