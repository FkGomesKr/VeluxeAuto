import {
  downloadCarImageFull,
  downloadCarImageThumbOrFull,
} from '~/server/utils/supabase-storage'
import { isRateLimited, getClientIp } from '~/server/utils/rate-limit'

const CACHE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  if (isRateLimited(`image:${ip}`, 300, 60_000)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const carId = parseInt(getRouterParam(event, 'carId') || '', 10)
  const index = parseInt(getRouterParam(event, 'index') || '', 10)

  if (Number.isNaN(carId) || Number.isNaN(index) || carId < 0 || index < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid carId or index' })
  }

  const query = getQuery(event)
  const forStockThumb =
    query.thumb === '1' || query.thumb === 'true' || query.thumb === true

  const config = useRuntimeConfig()
  const bucket = config.SUPABASE_STORAGE_BUCKET || 'car-images'

  const result = forStockThumb
    ? await downloadCarImageThumbOrFull(bucket, carId, index)
    : await downloadCarImageFull(bucket, carId, index)

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  const { data, contentType } = result
  const buffer = Buffer.from(await data.arrayBuffer())

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE}`,
  })

  return buffer
})
