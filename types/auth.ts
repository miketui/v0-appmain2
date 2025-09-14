export interface User {
  id: string
  email: string
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
  createdAt: string
  updatedAt: string
}

export interface UserSignUpData {
  displayName: string
  bio?: string
  houseName?: string
  role?: UserRole
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
  signUp: (email: string, password: string, userData: UserSignUpData) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: ProfileUpdateData) => Promise<void>
}