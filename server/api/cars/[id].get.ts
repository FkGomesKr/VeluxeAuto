import { CarsService } from '~/server/services/cars.service'
import { isCacheBusted } from '~/server/utils/cache-bust'
import { isRateLimited, getClientIp } from '~/server/utils/rate-limit'

const CACHE_MAX_AGE = 24 * 60 * 60 // 24 hours

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (isRateLimited(`car-id:${ip}`, 120, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

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
      'Cache-Control': isCacheBusted()
        ? 'no-cache, no-store, must-revalidate'
        : `public, max-age=300, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE}`,
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
