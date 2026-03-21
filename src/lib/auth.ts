import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const auth = {
  /**
   * Signs in a user with email and password.
   */
  signIn: async (email: string, password: string) => {
    const supabase = await createClient()
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
    const supabase = await createClient()
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
    return { data, error }
  },

  /**
   * Signs out the current user.
   */
  signOut: async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/sign-in')
  },

  /**
   * Retrieves the current user session.
   */
  getSession: async () => {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Retrieves the current user profile.
   */
  getUser: async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
}
