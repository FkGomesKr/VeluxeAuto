import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Creates an AWS S3 client for server-side operations
 */
export const createS3Client = () => {
  const config = useRuntimeConfig()
  
  const accessKeyId = config.AWS_ACCESS_KEY_ID
  const secretAccessKey = config.AWS_SECRET_ACCESS_KEY
  const region = config.AWS_REGION || 'us-east-1'
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials in environment variables')
  }
  
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
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
  const urls: string[] = []
  
  if (!picsNumber || picsNumber === 0) {
    return []
  }
  
  for (let i = 0; i < picsNumber; i++) {
    try {
      const key = `car-${carId}-${i}.jpg`
      const url = await getPresignedUrl(bucket, key, expiresIn)
      urls.push(url)
    } catch (error: any) {
      // Log error but continue - some images might not exist in S3
      console.error(`Failed to generate URL for car-${carId}-${i}.jpg:`, error.message)
      // Skip failed images
    }
  }
  
  return urls
}
