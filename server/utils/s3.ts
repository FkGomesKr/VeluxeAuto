import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Reusable S3 client instance (singleton pattern)
let s3ClientInstance: S3Client | null = null

/**
 * Creates or returns existing AWS S3 client for server-side operations
 * Reuses the same client instance for better performance
 */
export const createS3Client = () => {
  if (s3ClientInstance) {
    return s3ClientInstance
  }
  
  const config = useRuntimeConfig()
  
  const accessKeyId = config.AWS_ACCESS_KEY_ID
  const secretAccessKey = config.AWS_SECRET_ACCESS_KEY
  const region = config.AWS_REGION || 'us-east-1'
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials in environment variables')
  }
  
  s3ClientInstance = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
  
  return s3ClientInstance
}

/**
 * Generates a presigned URL for temporary access to S3 object
 * Used for secure, time-limited access to car images
 */
export const getPresignedUrl = async (
  bucket: string,
  key: string,
  expiresIn: number = 3600
) => {
  const s3Client = createS3Client()
  
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  })
  
  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generates image URLs for a car based on its ID and number of pictures
 * Format: car-{id}-{index}.jpg
 */
export const generateCarImageUrls = async (
  carId: number,
  picsNumber: number,
  bucket: string,
  expiresIn: number = 3600 * 24 * 7 // 7 days default
): Promise<string[]> => {
  if (!picsNumber || picsNumber === 0) {
    return []
  }
  
  // Generate all presigned URLs in parallel for better performance
  const urlPromises = Array.from({ length: picsNumber }, async (_, i) => {
    try {
      const key = `car-${carId}-${i}.jpg`
      return await getPresignedUrl(bucket, key, expiresIn)
    } catch (error: any) {
      // Log error but continue - some images might not exist in S3
      console.error(`Failed to generate URL for car-${carId}-${i}.jpg:`, error.message)
      return null // Return null for failed images
    }
  })
  
  // Wait for all URLs to be generated in parallel
  const urls = await Promise.all(urlPromises)
  
  // Filter out null values (failed image generations)
  return urls.filter((url): url is string => url !== null)
}
