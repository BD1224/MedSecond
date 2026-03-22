import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

/**
 * Shared Authentication logic using Supabase Auth.
 * 
 * All functions here utilize the centralized Supabase client from @/lib/db
 * to ensure consistent session handling and global configuration.
 */
export const auth = {
  /**
   * Signs in a user with email and password.
   */
  signIn: async (email: string, password: string) => {
    const supabase = await db.client()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  /**
   * Signs up a new user.
   */
  signUp: async (email: string, password: string, name: string, role: string) => {
    const supabase = await db.client()
    console.log('Attempting signup with:', { email, name, role });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })
    if (error) {
      console.error('Supabase auth.signUp error:', error);
    }
    if (data) {
      console.log('Supabase auth.signUp success:', { userId: data.user?.id });
    }
    return { data, error }
  },

  /**
   * Signs out the current user.
   */
  signOut: async () => {
    const supabase = await db.client()
    await supabase.auth.signOut()
    redirect('/auth/sign-in')
  },

  /**
   * Retrieves the current user session.
   */
  getSession: async () => {
    const supabase = await db.client()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Retrieves the current user profile.
   */
  getUser: async () => {
    const supabase = await db.client()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
}
