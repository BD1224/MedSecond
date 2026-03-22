'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Server Action: Handle user signup
 * 1. Creates Supabase auth user with email/password
 * 2. public.users row is auto-created via Supabase trigger
 * 3. assessor_profiles can be created separately after verification
 */
export async function handleSignUp(
  email: string,
  password: string,
  fullName: string,
  accountType: 'patient' | 'assessor',
  assessorData?: {
    role: string;
    institution: string;
    credentials: string;
  }
) {
  try {
    // Step 1: Create Supabase auth user with name and role in metadata
    const { data, error } = await auth.signUp(email, password, fullName, accountType);
    
    console.log('Auth signup result:', { email, accountType, data, error });

    if (error) {
      console.error('Auth signup error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user?.id) {
      console.error('No user ID returned from signup');
      return { success: false, error: 'Failed to create user account' };
    }

    const userId = data.user.id;
    console.log('User created with ID:', userId);

    // Store assessor data in metadata for later use (credentials, role, institution)
    // This will be stored in auth.users.raw_user_meta_data
    if (accountType === 'assessor' && assessorData) {
      console.log('Assessor signup with credentials:', {
        role: assessorData.role,
        institution: assessorData.institution,
      });
    }

    console.log('Signup completed successfully for:', { userId, accountType });
    return { success: true, userId, accountType };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error('Signup exception:', errorMessage, err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Handle user sign-in
 * 1. Authenticates user with email/password via Supabase Auth
 * 2. Retrieves user role from public.users table
 * 3. Returns success with user data and role for client-side redirect
 */
export async function handleSignIn(email: string, password: string) {
  try {
    // Step 1: Sign in with Supabase Auth
    const { data, error } = await auth.signIn(email, password);

    console.log('Auth signin result:', { email, data, error });

    if (error) {
      console.error('Auth signin error:', error);
      return { success: false, error: error.message };
    }

    if (!data.user?.id) {
      console.error('No user ID returned from signin');
      return { success: false, error: 'Failed to sign in' };
    }

    // Step 2: Get user profile to determine role
    const supabase = await db.client();
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    console.log('User profile lookup:', { userId: data.user.id, userProfile, profileError });

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return { success: false, error: 'Failed to retrieve user profile' };
    }

    const userRole = userProfile?.role || 'patient';
    console.log('Sign-in successful for:', { userId: data.user.id, role: userRole });

    return { success: true, userId: data.user.id, email: data.user.email, role: userRole };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error('Sign-in exception:', errorMessage, err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server Action: Get authenticated user profile
 * Fetches the current authenticated user and their profile data from the database
 */
export async function getUserProfile() {
  try {
    const supabase = await db.client();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, user: null };
    }

    // Get user profile from public.users table
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !userProfile) {
      return {
        success: true,
        user: {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || 'Patient',
          role: 'patient',
        },
      };
    }

    return {
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email || '',
        name: userProfile.name || authUser.email?.split('@')[0] || 'Patient',
        role: userProfile.role || 'patient',
      },
    };
  } catch (err) {
    console.error('Get user profile error:', err);
    return { success: false, user: null };
  }
}

/**
 * Server Action: Handle user logout
 * Signs out the authenticated user from Supabase
 */
export async function handleLogout() {
  try {
    const supabase = await db.client();
    await supabase.auth.signOut();
    console.log('User logged out successfully');
    return { success: true };
  } catch (err) {
    console.error('Logout error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Logout failed' };
  }
}


