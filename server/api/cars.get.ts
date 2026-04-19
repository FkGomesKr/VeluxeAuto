import { CarsService } from '~/server/services/cars.service'
import { isCacheBusted } from '~/server/utils/cache-bust'
import { isRateLimited, getClientIp } from '~/server/utils/rate-limit'

const CACHE_MAX_AGE = 6 * 60 * 60 // 6 hours
const DEV_CACHE_TTL = 5 * 60_000 // 5 minutes in-memory cache for dev

let memCache: { data: any; expires: number } | null = null

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (isRateLimited(`cars:${ip}`, 60, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  try {
    if (isCacheBusted()) {
      memCache = null
    }

    let cars
    if (memCache && Date.now() < memCache.expires) {
      cars = memCache.data
    } else {
      const carsService = new CarsService()
      cars = await carsService.getAllCars()
      memCache = { data: cars, expires: Date.now() + DEV_CACHE_TTL }
    }

    setResponseHeaders(event, {
      'Cache-Control': isCacheBusted()
        ? 'no-cache, no-store, must-revalidate'
        : `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE}`,
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
