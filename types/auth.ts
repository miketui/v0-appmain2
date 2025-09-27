export interface User {
  id: string
  email: string
  role: UserRole
  token?: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  userId: string
  displayName: string
  bio?: string
  avatar?: string
  role: UserRole
  houseName?: string
  house_id?: string
  display_name?: string
  createdAt: string
  updatedAt: string
}

export interface UserSignUpData {
  displayName: string
  display_name?: string
  bio?: string
  houseName?: string
  role?: UserRole
  pronouns?: string
  ballroom_name?: string
  experience?: string
  categories?: string
  why_join?: string
  social_media?: any
  status?: string
  house_id?: string
}

export interface ProfileUpdateData {
  displayName?: string
  bio?: string
  avatar?: string
  houseName?: string
}

export type UserRole = 'ADMIN' | 'LEADER' | 'MEMBER' | 'APPLICANT'

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signUp: (email: string, password: string, userData: UserSignUpData) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdateData) => Promise<void>
}