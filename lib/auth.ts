import { supabase } from "./api"
import { apiClient } from "./api"

export interface User {
  id: string
  email: string
  role: "applicant" | "member" | "leader" | "admin"
  profile?: {
    display_name?: string
    avatar_url?: string
    house_id?: string
  }
}

export class AuthService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data.session) {
      apiClient.setToken(data.session.access_token)
    }

    return data
  }

  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        data: userData,
      },
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    apiClient.setToken("")
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get additional profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return {
      id: user.id,
      email: user.email!,
      role: profile?.role || "applicant",
      profile: profile || undefined,
    }
  }

  async updateProfile(updates: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

    if (error) throw error
    return data
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        apiClient.setToken(session.access_token)
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()

export const signInWithEmail = (email: string, password: string) => authService.signIn(email, password)
export const getCurrentUser = () => authService.getCurrentUser()
export const signOut = () => authService.signOut()
