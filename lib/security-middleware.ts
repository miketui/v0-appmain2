/**
 * Security middleware for API routes
 * Provides CSRF protection, rate limiting, and security headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, securityHeaders, validateOrigin } from './security'

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>()

/**
 * Generate CSRF token using cryptographically secure random generation
 */
export function generateCSRFToken(sessionId: string): string {
  // Use Web Crypto API for cryptographically secure random generation
  const buffer = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(buffer)
  } else {
    // Node.js environment
    const crypto = require('crypto')
    const randomBytes = crypto.randomBytes(32)
    buffer.set(randomBytes)
  }

  // Convert to base64url (URL-safe base64)
  const token = Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + (60 * 60 * 1000) // 1 hour
  })

  return token
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId)
    return false
  }
  
  return stored.token === token
}

/**
 * Security middleware for API routes
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: {
    rateLimit?: { maxRequests: number; windowMs: number }
    requireCSRF?: boolean
    allowedOrigins?: string[]
    requireAuth?: boolean
    skipSameOrigin?: boolean
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const {
      rateLimit = { maxRequests: 100, windowMs: 15 * 60 * 1000 },
      requireCSRF = false,
      allowedOrigins = [],
      requireAuth = false,
      skipSameOrigin = true
    } = options

    // Add security headers to all responses
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    // Rate limiting
    const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const identifier = `${clientIP}:${req.nextUrl.pathname}`
    
    const rateLimitResult = checkRateLimit(
      identifier,
      rateLimit.maxRequests,
      rateLimit.windowMs
    )
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimit.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: response.headers
        }
      )
    }

    // Origin validation
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    
    if (!skipSameOrigin && origin) {
      const isAllowed = validateOrigin(origin, [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        ...allowedOrigins
      ])
      
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Origin not allowed' },
          { 
            status: 403,
            headers: response.headers
          }
        )
      }
    }

    // CSRF protection for state-changing methods
    if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const csrfToken = req.headers.get('x-csrf-token')
      const sessionId = req.headers.get('x-session-id') || clientIP
      
      if (!csrfToken || !validateCSRFToken(sessionId, csrfToken)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { 
            status: 403,
            headers: response.headers
          }
        )
      }
    }

    // Authentication check (if required)
    if (requireAuth) {
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { 
            status: 401,
            headers: response.headers
          }
        )
      }
    }

    // Call the actual handler
    try {
      const result = await handler(req)
      
      // Add security headers to the result
      Object.entries(securityHeaders).forEach(([key, value]) => {
        result.headers.set(key, value)
      })
      
      return result
    } catch (error) {
      console.error('API Error:', error)
      
      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      return NextResponse.json(
        { 
          error: isDevelopment ? (error as Error).message : 'Internal server error'
        },
        { 
          status: 500,
          headers: response.headers
        }
      )
    }
  }
}

/**
 * CORS middleware
 */
export function withCORS(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: {
    origin?: string | string[]
    methods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const {
      origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders = ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Session-ID'],
      credentials = true
    } = options

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      
      const requestOrigin = req.headers.get('origin')
      const allowedOrigins = Array.isArray(origin) ? origin : [origin]
      
      if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin)
      }
      
      response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
      response.headers.set('Access-Control-Max-Age', '86400')
      
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      
      return response
    }

    // Handle actual requests
    const response = await handler(req)
    
    const requestOrigin = req.headers.get('origin')
    const allowedOrigins = Array.isArray(origin) ? origin : [origin]
    
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin)
    }
    
    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    return response
  }
}

/**
 * Input validation middleware
 */
export function withValidation<T>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse> | NextResponse,
  validator: (data: any) => { success: boolean; data?: T; errors?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let body: any
    
    try {
      if (req.headers.get('content-type')?.includes('application/json')) {
        body = await req.json()
      } else {
        body = {}
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
    
    const validation = validator(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400 }
      )
    }
    
    return handler(req, validation.data!)
  }
}