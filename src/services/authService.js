import { supabase } from '../lib/supabase';

// Sign up with email and password
export const signUp = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase?.auth?.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase?.auth?.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Sign in with demo credentials
export const signInWithDemo = async () => {
  try {
    const demoCredentials = {
      email: 'admin@PilotBeta.com',
      password: 'admin123'
    }

    const { data, error } = await supabase?.auth?.signInWithPassword(demoCredentials)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Sign in with OAuth provider
export const signInWithOAuth = async (provider, options = {}) => {
  try {
    const { data, error } = await supabase?.auth?.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window?.location?.origin}/dashboard`,
        ...options
      }
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase?.auth?.signOut()

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    return { error: error?.message };
  }
}

// Get current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase?.auth?.getSession()

    if (error) {
      throw error
    }

    return { data: session, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase?.auth?.getUser()

    if (error) {
      throw error
    }

    return { data: user, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Get user profile with error handling for demo users
export const getUserProfile = async (userId = null) => {
  try {
    let query = supabase?.from('user_profiles')?.select('*')

    if (userId) {
      query = query?.eq('id', userId)
    } else {
      const { data: { user } } = await supabase?.auth?.getUser()
      if (!user) throw new Error('No authenticated user')
      query = query?.eq('id', user?.id)
    }

    const { data, error } = await query?.single()

    if (error) {
      // If profile doesn't exist, create one for the user
      if (error?.code === 'PGRST116') {
        const { data: { user } } = await supabase?.auth?.getUser()
        if (user) {
          const newProfile = {
            id: user?.id,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')?.[0] || 'User',
            role: 'member'
          }

          const { data: createdProfile, error: createError } = await supabase
            ?.from('user_profiles')
            ?.insert(newProfile)
            ?.select()
            ?.single()

          if (createError) {
            throw createError
          }

          return { data: createdProfile, error: null }
        }
      }
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase?.auth?.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error?.message };
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase?.auth?.resetPasswordForEmail(email, {
      redirectTo: `${window?.location?.origin}/reset-password`
    })

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    return { error: error?.message };
  }
}

// Update password
export const updatePassword = async (password) => {
  try {
    const { error } = await supabase?.auth?.updateUser({
      password
    })

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    return { error: error?.message };
  }
}

// Session persistence helper
export const setSessionPersistence = (rememberMe) => {
  try {
    if (rememberMe) {
      localStorage?.setItem('rememberMe', 'true')
    } else {
      localStorage?.removeItem('rememberMe')
      sessionStorage?.setItem('supabase.session.temporary', 'true')
    }
  } catch (error) {
    // Fail silently for session storage issues
  }
}

// Check if session should persist
export const shouldPersistSession = () => {
  try {
    return localStorage?.getItem('rememberMe') === 'true'
  } catch (error) {
    return false
  }
}

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex?.test(email);
}

// Validate password strength
export const validatePassword = (password) => {
  if (!password || password?.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  
  return { valid: true, message: '' }
}