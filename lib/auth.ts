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
    house_name?: string
    bio?: string
    pronouns?: string
    ballroom_experience?: string
    social_links?: any
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

  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
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

    // Get additional profile data from user_profiles table
    const { data: profile }: { data: any } = await supabase
      .from("user_profiles")
      .select(`
        *,
        house:houses(name, id)
      `)
      .eq("id", user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      role: profile?.role?.toLowerCase() || "applicant",
      profile: profile ? {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        house_id: profile.house_id,
        house_name: profile.house?.name,
        bio: profile.bio,
        pronouns: profile.pronouns,
        ballroom_experience: profile.ballroom_experience,
        social_links: profile.social_links,
      } : undefined,
    }
  }

  async updateProfile(updates: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await (supabase as any)
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)
      .select(`
        *,
        house:houses(name, id)
      `)
      .single()

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
export const signInWithMagicLink = (email: string) => authService.signInWithMagicLink(email)
export const getCurrentUser = () => authService.getCurrentUser()
export const signOut = () => authService.signOut()
