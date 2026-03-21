import { DatabaseService } from './database.service'
import type { Car, CarWithImages } from '~/server/schemas/cars'

/** Max images returned for the stock list (thumbnails). Detail page returns all. */
export const STOCK_LIST_MAX_IMAGES = 3

/** Detail page: full-size only (no thumb query). */
function generateFullImageUrls(carId: number, picsNumber: number): string[] {
  if (!picsNumber || picsNumber === 0) return []
  return Array.from({ length: picsNumber }, (_, i) => `/api/image/car/${carId}/${i}`)
}

/** Stock list: first N images with ?thumb=1 (thumb file, failover to full in the API). */
function generateStockListImageUrls(carId: number, picsNumber: number, maxImages: number): string[] {
  if (!picsNumber || picsNumber === 0) return []
  const count = Math.min(maxImages, picsNumber)
  return Array.from({ length: count }, (_, i) => `/api/image/car/${carId}/${i}?thumb=1`)
}

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

  /**
   * Get all cars with image URLs for the stock list only (first STOCK_LIST_MAX_IMAGES).
   * Reduces browser work and storage traffic; full gallery is on the car detail API.
   */
  async getAllCars(): Promise<CarFrontend[]> {
    const cars = await this.dbService.getAllItems<Car>('cars')

    const carsWithImages = cars.map((car) => {
      const picsNumber = (car as any).picsNumber || (car as any).pics_number || 0
      const images = generateStockListImageUrls(car.id, picsNumber, STOCK_LIST_MAX_IMAGES)
      return { ...car, images }
    })

    return carsWithImages.map(mapCarToFrontend)
  }

  /**
   * Get a single car by ID with its image URLs (mapped to frontend format).
   * Image URLs point to the server image proxy (Supabase Storage, Vercel-cached).
   */
  async getCarById(id: number): Promise<CarFrontend | null> {
    const car = await this.dbService.getItemById<Car>('cars', id)

    if (!car) {
      return null
    }

    const picsNumber = (car as any).picsNumber || (car as any).pics_number || 0
    const images = generateFullImageUrls(car.id, picsNumber)

    return mapCarToFrontend({ ...car, images })
  }
}
