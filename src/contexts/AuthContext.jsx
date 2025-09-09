import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    // Listen for auth changes - NEVER make this async
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
        
        // Handle session persistence based on remember me
        if (event === 'SIGNED_IN' && session) {
          const rememberMe = localStorage?.getItem('rememberMe') === 'true'
          if (!rememberMe) {
            // Set session to expire when browser closes
            sessionStorage?.setItem('supabase.auth.token', JSON.stringify(session))
            localStorage?.removeItem('supabase.auth.token')
          }
        }
        
        if (event === 'SIGNED_OUT') {
          localStorage?.removeItem('rememberMe')
          sessionStorage?.removeItem('supabase.auth.token')
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        return { data: null, error: error?.message }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error?.message || 'Sign up failed' }
    }
  }

  const signIn = async (email, password, options = {}) => {
    try {
      // Store remember me preference
      if (options?.rememberMe) {
        localStorage?.setItem('rememberMe', 'true')
      } else {
        localStorage?.removeItem('rememberMe')
      }

      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { data: null, error: error?.message }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error?.message || 'Sign in failed' }
    }
  }

  const signInWithDemo = async () => {
    try {
      // Demo credentials
      const demoEmail = 'admin@betapilot.com'
      const demoPassword = 'admin123'
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      })

      if (error) {
        // If demo user doesn't exist, provide helpful message
        if (error?.message?.includes('Invalid login credentials')) {
          return { 
            data: null, 
            error: 'Demo account not found. Please ensure the demo user exists in your Supabase project.' 
          }
        }
        return { data: null, error: error?.message }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error?.message || 'Demo login failed' }
    }
  }

  const signInWithOAuth = async (provider, options = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window?.location?.origin}/dashboard`,
          ...options
        }
      })

      if (error) {
        return { data: null, error: error?.message }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error?.message || 'OAuth sign in failed' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()

      if (error) {
        return { error: error?.message }
      }

      // Clean up session data
      localStorage?.removeItem('rememberMe')
      sessionStorage?.removeItem('supabase.auth.token')
      
      return { error: null }
    } catch (error) {
      return { error: error?.message || 'Sign out failed' }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window?.location?.origin}/reset-password`
      })

      if (error) {
        return { error: error?.message }
      }

      return { error: null }
    } catch (error) {
      return { error: error?.message || 'Password reset failed' }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithDemo,
    signInWithOAuth,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}