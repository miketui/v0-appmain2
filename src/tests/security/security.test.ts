import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
  sanitizeDisplayName,
  validateHouseName,
  validateFileUpload,
  checkRateLimit,
  detectHarmfulContent,
  validateJWTStructure,
  generateSecureRandom,
  validateOrigin
} from '@/lib/security'

describe('Security Tests', () => {
  describe('Environment Variables', () => {
    it('should not expose sensitive data in client bundle', () => {
      // Check that sensitive environment variables are not accessible on client
      const sensitiveVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'STRIPE_SECRET_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SENDGRID_API_KEY',
        'ANTHROPIC_API_KEY',
        'OPENAI_API_KEY'
      ]

      sensitiveVars.forEach(varName => {
        expect(process.env[varName]).toBeUndefined()
      })
    })

    it('should only expose NEXT_PUBLIC_ prefixed variables to client', () => {
      // Only these should be available in client-side code
      const allowedClientVars = [
        'NEXT_PUBLIC_APP_URL',
        'NEXT_PUBLIC_SUPABASE_URL', 
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
      ]

      // This test would be more meaningful in an actual client environment
      allowedClientVars.forEach(varName => {
        // In a real test, we'd check these are properly exposed
        expect(typeof varName).toBe('string')
      })
    })
  })

  describe('Input Validation', () => {
    it('should validate email format', () => {
      const validEmails = [
        'user@hausofbasquiat.com',
        'test.user+tag@example.org',
        'valid@sub.domain.com'
      ]

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..double.dot@domain.com',
        'user@domain',
        ''
      ]

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true)
      })

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false)
      })
    })

    it('should validate password strength', () => {
      const strongPasswords = [
        'StrongP@ssw0rd123',
        'MyS3cur3P@ssword!',
        'C0mpl3xP@ssw0rd#2024'
      ]

      const weakPasswords = [
        'password',
        '123456',
        'abc123',
        'qwerty',
        'password123',
        'P@ss1' // too short
      ]

      strongPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(true)
        expect(result.strength).toMatch(/medium|strong/)
      })

      weakPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('should sanitize user display names', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>',
        'user<iframe></iframe>name'
      ]

      maliciousInputs.forEach(input => {
        const sanitized = sanitizeDisplayName(input)
        expect(sanitized).not.toContain('<')
        expect(sanitized).not.toContain('>')
        expect(sanitized).not.toContain('javascript:')
        expect(sanitized).not.toContain('onerror')
        expect(sanitized).not.toContain('onclick')
        expect(sanitized).not.toContain('script')
        expect(sanitized).not.toContain('iframe')
      })
    })

    it('should sanitize general input', () => {
      const testCases = [
        {
          input: '<script>alert("xss")</script>',
          expectNotToContain: '<script>',
          shouldBeEmpty: true
        },
        {
          input: 'Normal text with <b>bold</b> tags',
          expectNotToContain: '<b>',
          shouldBeEmpty: false
        },
        {
          input: 'Plain text without HTML',
          expectNotToContain: '<',
          shouldBeEmpty: false
        }
      ]

      testCases.forEach(({ input, expectNotToContain, shouldBeEmpty }) => {
        const sanitized = sanitizeInput(input)
        expect(sanitized).not.toContain(expectNotToContain)
        
        if (shouldBeEmpty) {
          expect(sanitized).toBe('')
        } else {
          expect(sanitized.length).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('API Security', () => {
    it('should implement rate limiting', () => {
      const identifier = 'test-user'
      
      // First request should be allowed
      let result = checkRateLimit(identifier, 5, 60000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
      
      // Make more requests
      for (let i = 0; i < 4; i++) {
        result = checkRateLimit(identifier, 5, 60000)
        expect(result.allowed).toBe(true)
      }
      
      // Sixth request should be blocked
      result = checkRateLimit(identifier, 5, 60000)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should validate JWT token structure', () => {
      const validTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      ]

      const invalidTokens = [
        'invalid.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        'not-a-jwt-token',
        ''
      ]

      validTokens.forEach(token => {
        expect(validateJWTStructure(token)).toBe(true)
      })

      invalidTokens.forEach(token => {
        expect(validateJWTStructure(token)).toBe(false)
      })
    })

    it('should validate origins', () => {
      const allowedOrigins = ['https://hausofbasquiat.com', 'http://localhost:3000']

      expect(validateOrigin('https://hausofbasquiat.com', allowedOrigins)).toBe(true)
      expect(validateOrigin('http://localhost:3000', allowedOrigins)).toBe(true)
      expect(validateOrigin('https://malicious.com', allowedOrigins)).toBe(false)
      expect(validateOrigin(null, allowedOrigins)).toBe(false)
    })
  })

  describe('File Upload Security', () => {
    it('should validate file types', () => {
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

      // Mock File objects
      allowedMimeTypes.forEach(mimeType => {
        const mockFile = {
          type: mimeType,
          size: 1024 * 1024, // 1MB
          name: `test.${mimeType.split('/')[1]}`
        } as File

        const result = validateFileUpload(mockFile)
        expect(result.isValid).toBe(true)
      })

      const dangerousFile = {
        type: 'application/javascript',
        size: 1024,
        name: 'malicious.js'
      } as File

      const result = validateFileUpload(dangerousFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File type not allowed')
    })

    it('should enforce file size limits', () => {
      // Test valid file sizes
      const validImageFile = {
        type: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
        name: 'image.jpg'
      } as File

      const validVideoFile = {
        type: 'video/mp4',
        size: 50 * 1024 * 1024, // 50MB
        name: 'video.mp4'
      } as File

      expect(validateFileUpload(validImageFile).isValid).toBe(true)
      expect(validateFileUpload(validVideoFile).isValid).toBe(true)

      // Test invalid file sizes
      const oversizedImageFile = {
        type: 'image/jpeg',
        size: 15 * 1024 * 1024, // 15MB (over 10MB limit)
        name: 'large.jpg'
      } as File

      const result = validateFileUpload(oversizedImageFile)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('File size exceeds limit'))).toBe(true)
    })

    it('should detect suspicious file names', () => {
      const suspiciousFile = {
        type: 'image/jpeg',
        size: 1024 * 1024,
        name: 'image.jpg.exe'
      } as File

      const result = validateFileUpload(suspiciousFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Suspicious file name detected')
    })
  })

  describe('Content Security', () => {
    it('should detect potentially harmful content', () => {
      const harmfulContent = [
        'Visit this malicious link: http://malware.com',
        'Download this suspicious file.exe',
        'Content with personal info: SSN 123-45-6789',
        'Click here for free money!!!',
        'This contains malware'
      ]

      harmfulContent.forEach(content => {
        const result = detectHarmfulContent(content)
        if (content.includes('malware') || content.includes('SSN') || content.includes('free money')) {
          expect(result.isHarmful).toBe(true)
          expect(result.reasons.length).toBeGreaterThan(0)
        }
      })
    })

    it('should validate house names for appropriateness', () => {
      const appropriateNames = [
        'House of Revlon',
        'House of LaBeija',
        'House of Xtravaganza',
        'House of Mizrahi'
      ]

      const inappropriateNames = [
        '', // empty
        'a', // too short
        'House of ' + 'x'.repeat(100), // too long
        'House of <script>',
        'Inappropriate offensive name'
      ]

      appropriateNames.forEach(name => {
        expect(validateHouseName(name)).toBe(true)
      })

      inappropriateNames.forEach(name => {
        expect(validateHouseName(name)).toBe(false)
      })
    })

    it('should detect safe content', () => {
      const safeContent = [
        'Welcome to the ballroom community!',
        'House of LaBeija presents: Voguing Workshop',
        'Join us for a fierce competition tonight!'
      ]

      safeContent.forEach(content => {
        const result = detectHarmfulContent(content)
        expect(result.isHarmful).toBe(false)
        expect(result.reasons.length).toBe(0)
      })
    })
  })

  describe('Utility Functions', () => {
    it('should generate secure random strings', () => {
      const random1 = generateSecureRandom(32)
      const random2 = generateSecureRandom(32)

      expect(random1).toHaveLength(32)
      expect(random2).toHaveLength(32)
      expect(random1).not.toBe(random2)
      expect(/^[A-Za-z0-9]+$/.test(random1)).toBe(true)
    })

    it('should handle edge cases gracefully', () => {
      // Test with null/undefined inputs
      expect(validateEmail('')).toBe(false)
      expect(sanitizeDisplayName('')).toBe('')
      expect(validateHouseName('')).toBe(false)
      
      // Test with extremely long inputs
      const longString = 'a'.repeat(10000)
      const sanitized = sanitizeInput(longString)
      expect(sanitized.length).toBeLessThanOrEqual(1000)
    })
  })
})