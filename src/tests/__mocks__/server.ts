import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock handlers for API endpoints
export const handlers = [
  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: 3600,
      version: '1.0.0',
    })
  }),

  // Auth endpoints
  http.post('/api/auth/signin', async ({ request }) => {
    const body = await request.json() as any

    if (body?.email === 'test@example.com' && body?.password === 'password') {
      return HttpResponse.json({
        user: {
          id: 'user_1',
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'MEMBER',
        },
        token: 'mock-jwt-token',
      })
    }
    
    return new HttpResponse(null, { status: 401 })
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      user: {
        id: 'user_new',
        email: body?.email,
        displayName: body?.displayName,
        role: 'APPLICANT',
      },
      message: 'Account created successfully',
    }, { status: 201 })
  }),

  // User endpoints
  http.get('/api/users', () => {
    return HttpResponse.json([
      {
        id: 'user_1',
        displayName: 'Miss Tina',
        email: 'tina@hausofbasquiat.com',
        role: 'MEMBER',
        houseName: 'House of Revlon',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'user_2',
        displayName: 'Pepper LaBeija',
        email: 'pepper@hausofbasquiat.com',
        role: 'LEADER',
        houseName: 'House of LaBeija',
        status: 'active',
        createdAt: '2024-01-14T15:20:00Z',
      },
    ])
  }),

  // Posts/Feed endpoints
  http.get('/api/posts', () => {
    return HttpResponse.json([
      {
        id: 'post_1',
        content: 'Getting ready for tonight\'s ball! ✨',
        authorId: 'user_1',
        author: {
          displayName: 'Miss Tina',
          avatar: '',
        },
        createdAt: '2024-01-15T14:30:00Z',
        likes: 15,
        comments: 3,
      },
      {
        id: 'post_2',
        content: 'House practice session was fierce today! 🔥',
        authorId: 'user_2',
        author: {
          displayName: 'Pepper LaBeija',
          avatar: '',
        },
        createdAt: '2024-01-15T12:00:00Z',
        likes: 28,
        comments: 7,
      },
    ])
  }),

  // Gallery endpoints
  http.post('/api/gallery/upload', async ({ request }) => {
    return HttpResponse.json({
      id: 'upload_1',
      status: 'success',
      files: [
        {
          id: 'file_1',
          url: 'https://example.com/uploaded-file.jpg',
          thumbnail: 'https://example.com/uploaded-file-thumb.jpg',
        },
      ],
    }, { status: 201 })
  }),

  // Admin endpoints
  http.get('/api/admin/reports', () => {
    return HttpResponse.json([
      {
        id: 'report_1',
        type: 'content',
        reason: 'inappropriate_content',
        status: 'pending',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ])
  }),

  // Moderation endpoints
  http.post('/api/admin/moderate', async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      success: true,
      action: body?.action,
      targetId: body?.targetId,
    })
  }),

  // Socket.IO mock
  http.get('/api/socket/io', () => {
    return new HttpResponse('Socket.IO server endpoint', { status: 200 })
  }),
]

// Setup MSW server
export const server = setupServer(...handlers)