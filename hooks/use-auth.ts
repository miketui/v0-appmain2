"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/auth'
import { authService } from '@/lib/auth'
import { supabase } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password?: string) => Promise<any>
  signInWithMagicLink: (email: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session) {
          try {
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            console.error('Error getting user:', error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email: string, password?: string) => {
    setLoading(true)
    try {
      if (password) {
        return await authService.signIn(email, password)
      } else {
        return await authService.signInWithMagicLink(email)
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    setLoading(true)
    try {
      return await authService.signInWithMagicLink(email)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true)
    try {
      return await authService.signUp(email, password, userData)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      const updatedProfile = await authService.updateProfile(updates)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      return updatedProfile
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }