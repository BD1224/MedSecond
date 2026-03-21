import { createClient } from '@/utils/supabase/server'

/**
 * Database access utility using Supabase.
 */
export const db = {
  /**
   * Get a Supabase server client instance.
   */
  getSupabase: async () => {
    return await createClient();
  },

  /**
   * Execute a query using the Supabase client.
   * This is a simple wrapper to maintain some compatibility with the previous db.query pattern if needed,
   * though using the Supabase client directly is preferred.
   */
  query: async (table: string, queryBuilder: (supabase: any) => any) => {
    const supabase = await createClient();
    return await queryBuilder(supabase.from(table));
  },
};
