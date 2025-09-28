/**
 * CSRF Token API Route
 * Provides CSRF tokens for form submissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSecurity, generateCSRFToken } from '@/lib/security-middleware'

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  // Get session ID from headers or generate one
  const sessionId = req.headers.get('x-session-id') || 
                   req.ip || 
                   req.headers.get('x-forwarded-for') || 
                   'anonymous'

  const csrfToken = generateCSRFToken(sessionId)

  return NextResponse.json({
    csrfToken,
    sessionId
  })
}

// Apply security middleware
export const GET = withSecurity(handler, {
  rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  requireAuth: false,
  skipSameOrigin: false
})