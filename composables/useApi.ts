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
 * Composable for making API calls to server endpoints
 */
export const useApi = () => {
  /**
   * Get all cars with their images
   */
  const getCars = async (expiresIn?: number): Promise<CarFrontend[]> => {
    const params = expiresIn ? `?expiresIn=${expiresIn}` : ''
    const response = await $fetch<{ success: boolean; cars: CarFrontend[] }>(`/api/cars${params}`)
    return response.cars
  }

  /**
   * Get a single car by ID with its images
   */
  const getCarById = async (id: number, expiresIn?: number): Promise<CarFrontend> => {
    const params = expiresIn ? `?expiresIn=${expiresIn}` : ''
    const response = await $fetch<{ success: boolean; car: CarFrontend }>(`/api/cars/${id}${params}`)
    
    if (!response.success || !response.car) {
      throw new Error('Invalid response from API')
    }
    
    return response.car
  }

  return {
    getCars,
    getCarById
  }
}
