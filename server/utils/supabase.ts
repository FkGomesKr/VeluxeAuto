import { createClient } from '@supabase/supabase-js'

let serverSupabaseInstance: ReturnType<typeof createClient> | null = null

/**
 * Creates a Supabase client for server-side operations (database + storage).
 * Uses the service role key only – no public/anon key. All access is private and server-side.
 * The service role bypasses RLS and has full access; never expose this key to the client.
 */
export const createServerSupabaseClient = () => {
  if (serverSupabaseInstance) {
    return serverSupabaseInstance
  }

  const config = useRuntimeConfig()

  const supabaseUrl = config.SUPABASE_URL
  const serviceRoleKey = config.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable (use service role, not anon key)')
  }

  serverSupabaseInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return serverSupabaseInstance
}
