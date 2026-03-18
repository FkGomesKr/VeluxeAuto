import { downloadCarImage } from '~/server/utils/supabase-storage'

/**
 * Image proxy for car images stored in Supabase Storage.
 * GET /api/image/car/:carId/:index
 *
 * - Fetches the image from Supabase Storage using the service role (private, no public keys).
 * - Sets long-lived Cache-Control so Vercel caches the response and reduces Supabase requests.
 * - Images are updated rarely (~once a month), so 30 days cache is appropriate.
 */
const CACHE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export default defineEventHandler(async (event) => {
  const carId = parseInt(getRouterParam(event, 'carId') || '', 10)
  const index = parseInt(getRouterParam(event, 'index') || '', 10)

  if (Number.isNaN(carId) || Number.isNaN(index) || carId < 0 || index < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid carId or index' })
  }

  const config = useRuntimeConfig()
  const bucket = config.SUPABASE_STORAGE_BUCKET || 'car-images'

  const result = await downloadCarImage(bucket, carId, index)

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
