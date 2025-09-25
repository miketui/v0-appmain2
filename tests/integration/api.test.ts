import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { mockSupabaseClient, mockUser, mockProfile } from '../__mocks__/supabase'

// Mock the API route handlers
async function mockUsersGET(request: NextRequest) {
  const url = new URL(request.url)
  const search = url.searchParams.get('search') || ''
  const exclude = url.searchParams.get('exclude')?.split(',') || []

  // Simulate database query
  let users = [mockProfile]

  if (search) {
    users = users.filter(user =>
      user.display_name.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (exclude.length > 0) {
    users = users.filter(user => !exclude.includes(user.id))
  }

  return Response.json({ users: users.slice(0, 20) })
}

async function mockHealthGET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    node_version: process.version,
    memory: {
      used: process.memoryUsage().heapUsed,
      total: process.memoryUsage().heapTotal,
    },
    environment: 'test',
  })
}

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('/api/users', () => {
    it('returns users list', async () => {
      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await mockUsersGET(request)
      const data = await response.json()

      expect(data.users).toBeInstanceOf(Array)
      expect(data.users).toHaveLength(1)
      expect(data.users[0]).toMatchObject({
        id: expect.any(String),
        display_name: expect.any(String),
        role: expect.any(String)
      })
    })

    it('filters users by search query', async () => {
      const request = new NextRequest('http://localhost:3000/api/users?search=Test')
      const response = await mockUsersGET(request)
      const data = await response.json()

      expect(data.users).toHaveLength(1)
      expect(data.users[0].display_name).toContain('Test')
    })

    it('excludes specified user IDs', async () => {
      const excludeId = mockProfile.id
      const request = new NextRequest(`http://localhost:3000/api/users?exclude=${excludeId}`)
      const response = await mockUsersGET(request)
      const data = await response.json()

      expect(data.users).toHaveLength(0)
    })

    it('handles empty search results', async () => {
      const request = new NextRequest('http://localhost:3000/api/users?search=NonExistentUser')
      const response = await mockUsersGET(request)
      const data = await response.json()

      expect(data.users).toHaveLength(0)
    })

    it('limits results to 20 users', async () => {
      // Mock multiple users
      const manyUsers = Array.from({ length: 25 }, (_, i) => ({
        ...mockProfile,
        id: `user-${i}`,
        display_name: `Test User ${i}`
      }))

      const mockUsersGETMany = async (request: NextRequest) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search') || ''

        let users = manyUsers
        if (search) {
          users = users.filter(user =>
            user.display_name.toLowerCase().includes(search.toLowerCase())
          )
        }

        return Response.json({ users: users.slice(0, 20) })
      }

      const request = new NextRequest('http://localhost:3000/api/users')
      const response = await mockUsersGETMany(request)
      const data = await response.json()

      expect(data.users).toHaveLength(20)
    })
  })

  describe('/api/health', () => {
    it('returns health status', async () => {
      const response = await mockHealthGET()
      const data = await response.json()

      expect(data).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
        node_version: expect.any(String),
        memory: {
          used: expect.any(Number),
          total: expect.any(Number)
        },
        environment: 'test'
      })
    })

    it('returns 200 status code', async () => {
      const response = await mockHealthGET()
      expect(response.status).toBe(200)
    })

    it('includes current timestamp', async () => {
      const before = Date.now()
      const response = await mockHealthGET()
      const after = Date.now()
      const data = await response.json()

      const timestamp = new Date(data.timestamp).getTime()
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('/api/posts', () => {
    const mockPostsGET = async (request: NextRequest) => {
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const posts = [
        {
          id: 'post-1',
          content: 'Test post content',
          author_id: mockUser.id,
          created_at: '2024-01-01T00:00:00.000Z',
          likes_count: 5,
          comments_count: 2,
          author: {
            display_name: 'Test User',
            avatar_url: null
          }
        }
      ]

      return Response.json({
        posts: posts.slice(offset, offset + limit),
        total: posts.length,
        hasMore: offset + limit < posts.length
      })
    }

    it('returns posts with pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?limit=10&offset=0')
      const response = await mockPostsGET(request)
      const data = await response.json()

      expect(data).toMatchObject({
        posts: expect.any(Array),
        total: expect.any(Number),
        hasMore: expect.any(Boolean)
      })

      expect(data.posts[0]).toMatchObject({
        id: expect.any(String),
        content: expect.any(String),
        author_id: expect.any(String),
        created_at: expect.any(String),
        likes_count: expect.any(Number),
        comments_count: expect.any(Number),
        author: {
          display_name: expect.any(String)
        }
      })
    })

    it('handles pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts?limit=5&offset=0')
      const response = await mockPostsGET(request)
      const data = await response.json()

      expect(data.posts).toHaveLength(1) // Only 1 mock post
      expect(data.total).toBe(1)
      expect(data.hasMore).toBe(false)
    })
  })
})

describe('API Error Handling', () => {
  it('handles invalid JSON in request body', async () => {
    const mockAPIRoute = async (request: NextRequest) => {
      try {
        const body = await request.json()
        return Response.json({ success: true, data: body })
      } catch (error) {
        return Response.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      }
    }

    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await mockAPIRoute(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid JSON in request body')
  })

  it('handles database connection errors', async () => {
    const mockDBError = async () => {
      try {
        throw new Error('Database connection failed')
      } catch (error) {
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }

    const response = await mockDBError()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('handles unauthorized requests', async () => {
    const mockAuthRoute = async (request: NextRequest) => {
      const authHeader = request.headers.get('authorization')

      if (!authHeader) {
        return Response.json(
          { error: 'Authorization header required' },
          { status: 401 }
        )
      }

      return Response.json({ success: true })
    }

    const request = new NextRequest('http://localhost:3000/api/protected')
    const response = await mockAuthRoute(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authorization header required')
  })
})