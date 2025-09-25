import { vi } from 'vitest'

export const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@hausofbasquiat.com',
  role: 'Member',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

export const mockProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@hausofbasquiat.com',
  display_name: 'Test User',
  role: 'Member',
  status: 'active',
  house_id: null,
  created_at: '2024-01-01T00:00:00.000Z'
}

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: mockUser },
        error: null
      })
    ),
    signInWithOtp: vi.fn(() =>
      Promise.resolve({
        data: {},
        error: null
      })
    ),
    signOut: vi.fn(() =>
      Promise.resolve({
        error: null
      })
    ),
    onAuthStateChange: vi.fn(() => ({
      data: {
        subscription: {
          unsubscribe: vi.fn()
        }
      }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({
            data: mockProfile,
            error: null
          })
        ),
        limit: vi.fn(() =>
          Promise.resolve({
            data: [mockProfile],
            error: null
          })
        )
      })),
      in: vi.fn(() => ({
        limit: vi.fn(() =>
          Promise.resolve({
            data: [mockProfile],
            error: null
          })
        )
      })),
      limit: vi.fn(() =>
        Promise.resolve({
          data: [mockProfile],
          error: null
        })
      ),
      order: vi.fn(() =>
        Promise.resolve({
          data: [mockProfile],
          error: null
        })
      )
    })),
    insert: vi.fn(() =>
      Promise.resolve({
        data: mockProfile,
        error: null
      })
    ),
    update: vi.fn(() =>
      Promise.resolve({
        data: mockProfile,
        error: null
      })
    ),
    delete: vi.fn(() =>
      Promise.resolve({
        data: null,
        error: null
      })
    )
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() =>
        Promise.resolve({
          data: { path: 'test-file.jpg' },
          error: null
        })
      ),
      remove: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: null
        })
      ),
      getPublicUrl: vi.fn(() => ({
        data: { publicUrl: 'https://test.supabase.co/storage/test-file.jpg' }
      }))
    }))
  }
}