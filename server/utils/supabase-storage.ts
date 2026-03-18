import { createServerSupabaseClient } from '~/server/utils/supabase'

/**
 * Storage path for a car image. Matches previous S3 key format: car-{id}-{index}.jpg
 */
export function getCarImagePath(carId: number, index: number): string {
  return `car-${carId}-${index}.jpg`
}

/**
 * Downloads a car image from Supabase Storage (private bucket, service role).
 * Returns the file blob and content type for use in the image proxy.
 */
export async function downloadCarImage(
  bucket: string,
  carId: number,
  index: number
): Promise<{ data: Blob; contentType: string } | null> {
  const supabase = createServerSupabaseClient()
  const path = getCarImagePath(carId, index)

  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error || !data) {
    return null
  }

  const contentType = data.type || 'image/jpeg'
  return { data, contentType }
}
