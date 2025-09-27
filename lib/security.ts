/**
 * Security utilities for the Haus of Basquiat Portal
 * Centralized security functions for input validation, sanitization, and protection
 */

import DOMPurify from 'dompurify'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Email validation with comprehensive checks
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email)) return false
  
  // Check for consecutive dots
  if (email.includes('..')) return false
  
  // Check for dot at start or end of local part
  const [localPart, domain] = email.split('@')
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false
  
  // Domain must have at least one dot
  if (!domain || !domain.includes('.')) return false
  
  return true
}

/**
 * Password strength validation
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'], strength: 'weak' }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common')
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  // Use DOMPurify for robust HTML sanitization
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
  
  return clean.trim().substring(0, 1000) // Limit length
}

/**
 * Sanitize display names with stricter rules
 */
export function sanitizeDisplayName(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  let sanitized = input
  let prev: string
  
  // Remove HTML tags and dangerous content in multiple passes
  do {
    prev = sanitized
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>?/gi, '')
    // Remove dangerous protocols
    sanitized = sanitized.replace(/(javascript:|data:|vbscript:|about:|file:)/gi, '')
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=?\s*[^>\s]*/gi, '')
    // Remove HTML entities that could be used for XSS
    sanitized = sanitized.replace(/&[#\w]+;/gi, '')
  } while (sanitized !== prev)
  
  // Remove any script-related keywords that might have been partially removed
  sanitized = sanitized.replace(/(?:script|iframe|object|embed|form)/gi, '')
  
  // Remove quote characters that could break out of attributes
  sanitized = sanitized.replace(/[<>"'`]/g, '')
  
  return sanitized.trim().substring(0, 50) // Limit length
}

/**
 * Validate house names for appropriateness
 */
export function validateHouseName(name: string): boolean {
  if (!name || name.trim().length < 5) return false
  if (name.length > 50) return false
  if (/<[^>]*>/.test(name)) return false // HTML tags
  if (/script/i.test(name)) return false // Script injection
  
  // Check for inappropriate content
  const inappropriateWords = [
    'inappropriate', 'offensive', 'hate', 'discriminatory',
    'racist', 'sexist', 'homophobic', 'transphobic',
    'nazi', 'terrorist', 'violence', 'abuse'
  ]
  
  const lowerName = name.toLowerCase()
  if (inappropriateWords.some(word => lowerName.includes(word))) {
    return false
  }
  
  return true
}

/**
 * Validate file uploads
 */
export function validateFileUpload(file: File): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mov',
    'audio/mp3',
    'audio/wav'
  ]
  
  // Check MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    errors.push('File type not allowed')
  }
  
  // Check file size limits (in bytes)
  const maxSizes = {
    'image/jpeg': 10 * 1024 * 1024, // 10MB
    'image/png': 10 * 1024 * 1024,  // 10MB
    'image/gif': 10 * 1024 * 1024,  // 10MB
    'image/webp': 10 * 1024 * 1024, // 10MB
    'video/mp4': 100 * 1024 * 1024, // 100MB
    'video/mov': 100 * 1024 * 1024, // 100MB
    'audio/mp3': 50 * 1024 * 1024,  // 50MB
    'audio/wav': 50 * 1024 * 1024   // 50MB
  }
  
  const maxSize = maxSizes[file.type as keyof typeof maxSizes]
  if (maxSize && file.size > maxSize) {
    errors.push(`File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`)
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i,
    /\.(php|asp|jsp|sh)$/i,
    /\.\w+\.(exe|bat|cmd|com|pif|scr|vbs|js)$/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('Suspicious file name detected')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Rate limiting implementation
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const current = rateLimitStore.get(identifier)
  
  if (!current || now > current.resetTime) {
    // First request or window expired
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime
    }
  }
  
  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  // Increment counter
  current.count++
  rateLimitStore.set(identifier, current)
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  }
}

/**
 * Detect potentially harmful content
 */
export function detectHarmfulContent(content: string): {
  isHarmful: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  const harmfulPatterns = [
    { pattern: /http:\/\/[^\s]+\.exe/i, reason: 'Suspicious executable link' },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/, reason: 'Potential SSN detected' },
    { pattern: /free money|get rich quick/i, reason: 'Potential spam content' },
    { pattern: /malware|virus|trojan/i, reason: 'Malicious software reference' },
    { pattern: /download.*\.exe|click.*\.exe/i, reason: 'Suspicious download link' },
    { pattern: /phishing|scam|fraud/i, reason: 'Potential fraudulent content' }
  ]
  
  harmfulPatterns.forEach(({ pattern, reason }) => {
    if (pattern.test(content)) {
      reasons.push(reason)
    }
  })
  
  return {
    isHarmful: reasons.length > 0,
    reasons
  }
}

/**
 * JWT token validation (structure only - actual verification should be done server-side)
 */
export function validateJWTStructure(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  return jwtPattern.test(token)
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    // Browser environment
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Node.js environment - fallback to Math.random (not cryptographically secure)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  
  return result
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

/**
 * Check if request is from allowed origin
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false
  return allowedOrigins.includes(origin)
}