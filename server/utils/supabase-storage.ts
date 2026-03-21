import { createServerSupabaseClient } from '~/server/utils/supabase'

/**
 * Storage path for a car image. Matches previous S3 key format: car-{id}-{index}.jpg
 */
export function getCarImagePath(carId: number, index: number): string {
  return `car-${carId}-${index}.jpg`
}

/**
 * Thumbnail path from scripts/make-thumbnails.mjs: car-1-0.jpg → car-1-0-thumb.jpg
 */
export function getCarThumbPath(carId: number, index: number): string {
  return `car-${carId}-${index}-thumb.jpg`
}

async function downloadStoragePath(
  bucket: string,
  objectPath: string
): Promise<{ data: Blob; contentType: string } | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.storage.from(bucket).download(objectPath)
  if (error || !data) {
    return null
  }
  return { data, contentType: data.type || 'image/jpeg' }
}

/** Full-size only — used for car detail (never touches *-thumb.jpg). */
export async function downloadCarImageFull(
  bucket: string,
  carId: number,
  index: number
): Promise<{ data: Blob; contentType: string } | null> {
  return downloadStoragePath(bucket, getCarImagePath(carId, index))
}

/**
 * Stock list only: try *-thumb.jpg, then full-size if missing.
 */
export async function downloadCarImageThumbOrFull(
  bucket: string,
  carId: number,
  index: number
): Promise<{ data: Blob; contentType: string } | null> {
  const thumb = await downloadStoragePath(bucket, getCarThumbPath(carId, index))
  if (thumb) {
    return thumb
  }
  return downloadStoragePath(bucket, getCarImagePath(carId, index))
}
