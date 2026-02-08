/**
 * Cars table schema definition
 * 
 * The SQL schema is in cars.sql - run it manually in Supabase SQL Editor
 * The server will automatically check if the table exists on startup and warn if missing
 */

export interface Car {
  id: number
  brand: string
  model: string
  year: number
  price: number
  mileage?: number | null
  fuel_type?: string | null
  transmission?: string | null
  color?: string | null
  description?: string | null
  power?: number | null
  displacement?: number | null
  condition?: string | null
  seats?: number | null
  doors?: number | null
  body_type?: string | null
  consumption?: number | null
  pics_number: number  // PostgreSQL stores as snake_case
  created_at?: string
  updated_at?: string
}

export interface CarWithImages extends Car {
  images: string[]
}
