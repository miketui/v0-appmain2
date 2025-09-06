import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// API client for backend endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication endpoints
  async signIn(email: string, password: string) {
    return this.request("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signUp(userData: any) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // User endpoints
  async getProfile() {
    return this.request("/users/profile")
  }

  async updateProfile(data: any) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Posts endpoints
  async getPosts(page = 1, limit = 20) {
    return this.request(`/posts?page=${page}&limit=${limit}`)
  }

  async createPost(data: any) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: "POST",
    })
  }

  // Chat endpoints
  async getChats() {
    return this.request("/chats")
  }

  async getMessages(chatId: string) {
    return this.request(`/chats/${chatId}/messages`)
  }

  async sendMessage(chatId: string, content: string, attachments?: any[]) {
    return this.request(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, attachments }),
    })
  }

  // Admin endpoints
  async getUsers(page = 1, limit = 20) {
    return this.request(`/admin/users?page=${page}&limit=${limit}`)
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
