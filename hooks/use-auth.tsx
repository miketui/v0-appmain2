"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { authService } from "@/lib/auth"
import type { 
  User, 
  AuthContextType, 
  UserSignUpData, 
  ProfileUpdateData 
} from "@/types/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    authService
      .getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false))

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(setUser)

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
      const user = await authService.getCurrentUser()
      setUser(user)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: UserSignUpData) => {
    setLoading(true)
    try {
      await authService.signUp(email, password, userData)
    } catch (error) {
      console.error('Sign up failed:', error)
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
      console.error('Sign out failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!user) {
      throw new Error('No user logged in')
    }
    
    try {
      const updatedProfile = await authService.updateProfile(updates)
      setUser({ ...user, profile: updatedProfile })
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
