import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"
import { clientEnv } from "./env"

export const supabase = createClient<Database>(
  clientEnv.NEXT_PUBLIC_SUPABASE_URL,
  clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// API client for backend endpoints  
const API_BASE_URL = clientEnv.NEXT_PUBLIC_API_URL

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
    return this.request("/auth/login", {
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

  async submitApplication(applicationData: any) {
    return this.request("/auth/apply", {
      method: "POST",
      body: JSON.stringify(applicationData),
    })
  }

  // User endpoints
  async getProfile() {
    return this.request("/auth/profile")
  }

  async updateProfile(data: any) {
    return this.request("/auth/profile", {
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
  async getThreads() {
    return this.request("/chat/threads")
  }

  async createThread(participantIds: string[], name?: string, threadType = "direct") {
    return this.request("/chat/threads", {
      method: "POST",
      body: JSON.stringify({ participantIds, name, threadType }),
    })
  }

  async getMessages(threadId: string, page = 1, limit = 50) {
    return this.request(`/chat/threads/${threadId}/messages?page=${page}&limit=${limit}`)
  }

  async sendMessage(threadId: string, content: string, messageType = "text", replyTo?: string) {
    return this.request(`/chat/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, messageType, replyTo }),
    })
  }

  // Admin endpoints  
  async getUsers(search = "", exclude: string[] = []) {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (exclude.length > 0) params.set("exclude", exclude.join(","))
    
    return this.request(`/users?${params.toString()}`)
  }

  async getApplications(status = "pending") {
    return this.request(`/admin/applications?status=${status}`)
  }

  async reviewApplication(applicationId: string, status: string, reviewNotes?: string, assignedHouse?: string) {
    return this.request(`/admin/applications/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify({ status, reviewNotes, assignedHouse }),
    })
  }

  async getHouses() {
    return this.request("/houses")
  }

  async getDocuments(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set("category", params.category)
    if (params?.search) searchParams.set("search", params.search)  
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    
    return this.request(`/documents?${searchParams.toString()}`)
  }

  async downloadDocument(documentId: string) {
    return this.request(`/documents/${documentId}/download`)
  }

  async getDocumentCategories() {
    return this.request("/documents/categories")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
