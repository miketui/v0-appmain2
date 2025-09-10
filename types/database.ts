// Database type definitions for Supabase
// This file should be auto-generated from your Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          house_id: string | null
          status: 'pending' | 'active' | 'banned'
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          pronouns: string | null
          ballroom_experience: string | null
          social_links: any | null
          profile_data: any | null
          login_code: string | null
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          house_id?: string | null
          status?: 'pending' | 'active' | 'banned'
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          pronouns?: string | null
          ballroom_experience?: string | null
          social_links?: any | null
          profile_data?: any | null
          login_code?: string | null
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'Applicant' | 'Member' | 'Leader' | 'Admin'
          house_id?: string | null
          status?: 'pending' | 'active' | 'banned'
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          pronouns?: string | null
          ballroom_experience?: string | null
          social_links?: any | null
          profile_data?: any | null
          login_code?: string | null
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      houses: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          leader_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          leader_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          leader_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string | null
          media_urls: string[] | null
          visibility: 'public' | 'house_only' | 'members_only'
          house_id: string | null
          moderation_status: 'pending' | 'approved' | 'flagged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content?: string | null
          media_urls?: string[] | null
          visibility?: 'public' | 'house_only' | 'members_only'
          house_id?: string | null
          moderation_status?: 'pending' | 'approved' | 'flagged'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string | null
          media_urls?: string[] | null
          visibility?: 'public' | 'house_only' | 'members_only'
          house_id?: string | null
          moderation_status?: 'pending' | 'approved' | 'flagged'
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          reply_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          reply_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          reply_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_threads: {
        Row: {
          id: string
          name: string | null
          thread_type: 'direct' | 'group'
          participants: string[]
          created_by: string
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          thread_type?: 'direct' | 'group'
          participants: string[]
          created_by: string
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          thread_type?: 'direct' | 'group'
          participants?: string[]
          created_by?: string
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          content: string | null
          message_type: 'text' | 'image' | 'file'
          file_url: string | null
          reply_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          sender_id: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          reply_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          sender_id?: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          reply_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          category: string
          file_url: string
          file_type: string
          file_size: number
          uploader_id: string
          access_level: 'Member' | 'Leader' | 'Admin'
          tags: string[]
          download_count: number
          moderation_status: 'pending' | 'approved' | 'flagged'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          file_url: string
          file_type: string
          file_size: number
          uploader_id: string
          access_level?: 'Member' | 'Leader' | 'Admin'
          tags?: string[]
          download_count?: number
          moderation_status?: 'pending' | 'approved' | 'flagged'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          file_url?: string
          file_type?: string
          file_size?: number
          uploader_id?: string
          access_level?: 'Member' | 'Leader' | 'Admin'
          tags?: string[]
          download_count?: number
          moderation_status?: 'pending' | 'approved' | 'flagged'
          created_at?: string
          updated_at?: string
        }
      }
      user_applications: {
        Row: {
          id: string
          user_id: string
          applicant_data: any
          status: 'pending' | 'approved' | 'rejected'
          review_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          applicant_data: any
          status?: 'pending' | 'approved' | 'rejected'
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          applicant_data?: any
          status?: 'pending' | 'approved' | 'rejected'
          review_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'Applicant' | 'Member' | 'Leader' | 'Admin'
      user_status: 'pending' | 'active' | 'banned'
      application_status: 'pending' | 'approved' | 'rejected'
      moderation_status: 'pending' | 'approved' | 'flagged'
      thread_type: 'direct' | 'group'
      message_type: 'text' | 'image' | 'file'
      post_visibility: 'public' | 'house_only' | 'members_only'
      notification_type: 'like' | 'comment' | 'message' | 'application' | 'system'
    }
  }
}