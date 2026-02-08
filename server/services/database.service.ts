import { createServerSupabaseClient } from '~/server/utils/supabase'

/**
 * Database service for read-only Supabase operations
 */
export class DatabaseService {
  private supabase = createServerSupabaseClient()

  /**
   * Get all items from a table
   */
  async getAllItems<T = any>(tableName: string): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true }) // Consistent ordering
    
    if (error) throw error
    return data || []
  }

  /**
   * Get item by ID
   */
  async getItemById<T = any>(tableName: string, id: string | number): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  /**
   * Get the underlying Supabase client for custom queries
   */
  getClient() {
    return this.supabase
  }
}
