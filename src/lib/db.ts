import { createClient } from '@/utils/supabase/server'

/**
 * Centralized Database Access Utility.
 * 
 * This utility provides a consistent way to obtain a Supabase client instance.
 * By using this centralized entry point, we can easily manage global configurations
 * or add error handling/logging in one place if needed in the future.
 */
export const db = {
  /**
   * Returns a fresh Supabase client instance for server-side operations.
   * Use this for all data fetching and mutations in Server Components and Server Actions.
   * 
   * @example
   * const supabase = await db.client();
   * const { data } = await supabase.from('table').select('*');
   */
  client: async () => {
    return await createClient();
  },
};
