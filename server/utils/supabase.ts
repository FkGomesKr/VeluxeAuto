import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side read operations
 * Uses anon key since we only need read access (no auth required)
 */
export const createServerSupabaseClient = () => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.SUPABASE_URL
  const supabaseAnonKey = config.SUPABASE_ANON_KEY
  
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable')
  }
  
  if (!supabaseAnonKey) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
