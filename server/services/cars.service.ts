import { DatabaseService } from './database.service'
import { generateCarImageUrls } from '~/server/utils/s3'
import type { Car, CarWithImages } from '~/server/schemas/cars'

/**
 * Frontend car interface (Portuguese field names)
 */
export interface CarFrontend {
  id: number
  marca: string
  modelo: string
  combustivel: string
  anoReg: number
  preco: string
  transmissao: string
  tipologia: string
  lugares: number
  kms: number
  imagens: string[]
  potencia?: number | null
  cilindrada?: number | null
  estado?: string | null
  portas?: number | null
  consumo?: number | null
  cor?: string | null
}

/**
 * Maps English DB car to Portuguese frontend format
 */
function mapCarToFrontend(car: CarWithImages): CarFrontend {
  // Format price as string with comma and space (e.g., "12, 990")
  // Match the format used in the component: "12, 990"
  const priceInt = Math.round(car.price)
  const priceStr = priceInt.toString()
  // Add comma separator every 3 digits from right, then replace first comma with ", "
  const formattedPrice = priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(',', ', ')
  
  return {
    id: car.id,
    marca: car.brand,
    modelo: car.model,
    combustivel: car.fuel_type || '',
    anoReg: car.year,
    preco: formattedPrice,
    transmissao: car.transmission || '',
    tipologia: car.body_type || '',
    lugares: car.seats || 0,
    kms: car.mileage || 0,
    imagens: car.images,
    potencia: car.power,
    cilindrada: car.displacement,
    estado: car.condition,
    portas: car.doors,
    consumo: car.consumption,
    cor: car.color
  }
}

/**
 * Cars service - handles car data and image URL generation
 */
export class CarsService {
  private dbService = new DatabaseService()
  private bucket: string

  constructor() {
    const config = useRuntimeConfig()
    this.bucket = config.AWS_S3_BUCKET || ''
    
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET environment variable is required')
    }
  }

  /**
   * Get all cars with their image URLs (mapped to frontend format)
   */
  async getAllCars(expiresIn: number = 3600 * 24 * 7): Promise<CarFrontend[]> {
    const cars = await this.dbService.getAllItems<Car>('cars')
    
    const carsWithImages = await Promise.all(
      cars.map(async (car) => {
        try {
          // Handle both camelCase and snake_case for picsNumber
          const picsNumber = (car as any).picsNumber || (car as any).pics_number || 0
          const images = await generateCarImageUrls(
            car.id,
            picsNumber,
            this.bucket,
            expiresIn
          )
          return { ...car, images }
        } catch (error: any) {
          console.error(`Error generating images for car ${car.id}:`, error.message)
          // Return car with empty images array if URL generation fails
          return { ...car, images: [] }
        }
      })
    )
    
    return carsWithImages.map(mapCarToFrontend)
  }

  /**
   * Get a single car by ID with its image URLs (mapped to frontend format)
   */
  async getCarById(id: number, expiresIn: number = 3600 * 24 * 7): Promise<CarFrontend | null> {
    const car = await this.dbService.getItemById<Car>('cars', id)
    
    if (!car) {
      return null
    }
    
    // Handle both camelCase and snake_case for picsNumber
    const picsNumber = (car as any).picsNumber || (car as any).pics_number || 0
    const images = await generateCarImageUrls(
      car.id,
      picsNumber,
      this.bucket,
      expiresIn
    )
    
    return mapCarToFrontend({ ...car, images })
  }
}
