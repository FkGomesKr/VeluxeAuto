import { createServerSupabaseClient } from './supabase'

/**
 * Migration SQL for cars table
 */
const CARS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mileage INTEGER,
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  color VARCHAR(100),
  description TEXT,
  power INTEGER,
  displacement INTEGER,
  condition VARCHAR(100),
  seats INTEGER,
  doors INTEGER,
  body_type VARCHAR(100),
  consumption DECIMAL(5, 2),
  picsNumber INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
`

/**
 * Runs database migrations
 * Checks if tables exist and creates them if they don't
 */
export async function runMigrations() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if cars table exists by trying to query it
    const { error: checkError } = await supabase
      .from('cars')
      .select('id')
      .limit(1)
    
    // If table doesn't exist, create it
    if (checkError && checkError.code === '42P01') {
      console.log('📦 Creating cars table...')
      
      // Execute the migration SQL
      const { error: migrationError } = await supabase.rpc('exec_sql', {
        sql: CARS_TABLE_SQL
      })
      
      // If RPC doesn't work, try direct query (requires service role)
      // For now, we'll log and let user know to run manually
      if (migrationError) {
        console.warn('⚠️  Automatic migration failed. Please run the SQL manually in Supabase SQL Editor.')
        console.warn('SQL:', CARS_TABLE_SQL)
        return false
      }
      
      console.log('✅ Cars table created successfully')
      return true
    } else if (checkError) {
      console.error('❌ Error checking cars table:', checkError.message)
      return false
    } else {
      console.log('✅ Cars table already exists')
      return true
    }
  } catch (error: any) {
    console.error('❌ Migration error:', error.message)
    return false
  }
}

/**
 * Checks if cars table exists (with timeout)
 * Non-blocking - won't prevent server startup
 */
export async function ensureCarsTable() {
  try {
    const config = useRuntimeConfig()
    
    // Skip check if Supabase isn't configured
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      console.warn('⚠️  Supabase credentials not configured - skipping table check')
      return false
    }
    
    const supabase = createServerSupabaseClient()
    
    // Create a promise with timeout
    const checkPromise = supabase
      .from('cars')
      .select('id')
      .limit(0)
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
    
    // Race between query and timeout
    const { error } = await Promise.race([
      checkPromise,
      timeoutPromise
    ]) as { error?: any }
    
    if (error) {
      if (error.code === '42P01') {
        console.warn('⚠️  Cars table does not exist!')
        console.warn('📝 Please run the SQL from server/schemas/cars.sql in Supabase SQL Editor')
        return false
      } else {
        console.warn('⚠️  Could not check cars table:', error.message)
        return false
      }
    }
    
    console.log('✅ Cars table exists')
    return true
  } catch (error: any) {
    if (error.message === 'Timeout') {
      console.warn('⚠️  Database check timed out - server will continue')
      console.warn('📝 Make sure Supabase credentials are configured correctly')
    } else {
      console.warn('⚠️  Error checking cars table:', error.message)
    }
    return false
  }
}
