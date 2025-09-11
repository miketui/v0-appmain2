/**
 * Security utilities for client-side protection
 * Provides input validation, sanitization, and security checks
 */

import DOMPurify from 'dompurify';

/**
 * Content Security and Sanitization
 */
export class SecurityUtils {
  static instance = null;

  constructor() {
    if (SecurityUtils.instance) {
      return SecurityUtils.instance;
    }
    
    this.setupDOMPurify();
    SecurityUtils.instance = this;
  }

  /**
   * Configure DOMPurify with ballroom community-specific settings
   */
  setupDOMPurify() {
    // Allow safe HTML tags for rich content
    this.allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'video', 'audio'
    ];

    this.allowedAttributes = {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'video': ['src', 'controls', 'width', 'height', 'poster'],
      'audio': ['src', 'controls']
    };

    // Configure DOMPurify
    DOMPurify.setConfig({
      ALLOWED_TAGS: this.allowedTags,
      ALLOWED_ATTR: Object.values(this.allowedAttributes).flat(),
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });
  }

  /**
   * Sanitize HTML content for safe display
   * @param {string} html - Raw HTML content
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized HTML
   */
  sanitizeHTML(html, options = {}) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    const config = {
      ...DOMPurify.getConfig(),
      ...options
    };

    return DOMPurify.sanitize(html, config);
  }

  /**
   * Sanitize user input for display in comments, posts, etc.
   * @param {string} input - User input
   * @returns {string} Sanitized content
   */
  sanitizeUserContent(input) {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // First, escape HTML entities to prevent XSS
    const escaped = this.escapeHTML(input);
    
    // Then allow safe formatting with basic markdown-like syntax
    return this.processBasicFormatting(escaped);
  }

  /**
   * Escape HTML entities
   * @param {string} text - Raw text
   * @returns {string} Escaped text
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Process basic formatting (bold, italic, links) safely
   * @param {string} text - Escaped text
   * @returns {string} Formatted HTML
   */
  processBasicFormatting(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert URLs to safe links
    text = this.linkifyURLs(text);
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
  }

  /**
   * Convert URLs to safe clickable links
   * @param {string} text - Text containing URLs
   * @returns {string} Text with linkified URLs
   */
  linkifyURLs(text) {
    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    return text.replace(urlRegex, (url) => {
      // Validate and sanitize the URL
      if (this.isValidURL(url)) {
        const safeURL = this.sanitizeURL(url);
        return `<a href="${safeURL}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      }
      return url;
    });
  }

  /**
   * Validate if a URL is safe to link to
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is safe
   */
  isValidURL(url) {
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Block known malicious domains
      const maliciousDomains = [
        'malware.com',
        'phishing.com',
        'spam.com'
      ];
      
      if (maliciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize URL for safe usage
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  sanitizeURL(url) {
    try {
      const urlObj = new URL(url);
      // Reconstruct URL with only safe components
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
    } catch {
      return '#';
    }
  }

  /**
   * Validate file uploads for security
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.pdf']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`);
    }

    // Check for suspicious file names
    if (this.isSuspiciousFileName(file.name)) {
      errors.push('File name contains suspicious characters');
    }

    // Basic magic number validation (file signature check)
    if (!this.validateFileSignature(file)) {
      errors.push('File signature does not match declared type');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: this.getFileWarnings(file)
    };
  }

  /**
   * Check if filename contains suspicious characters
   * @param {string} filename - File name to check
   * @returns {boolean} Whether filename is suspicious
   */
  isSuspiciousFileName(filename) {
    // Check for path traversal attempts
    if (filename.includes('../') || filename.includes('..\\')) {
      return true;
    }

    // Check for null bytes
    if (filename.includes('\0')) {
      return true;
    }

    // Check for suspicious extensions in filename
    const suspiciousPatterns = [
      /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i,
      /\.com$/i, /\.pif$/i, /\.vbs$/i, /\.js$/i,
      /\.jar$/i, /\.php$/i, /\.asp$/i, /\.jsp$/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Basic file signature validation
   * @param {File} file - File to validate
   * @returns {Promise<boolean>} Whether file signature is valid
   */
  async validateFileSignature(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target.result);
        const signature = Array.from(bytes.slice(0, 8))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');

        const validSignatures = {
          'image/jpeg': ['ffd8ff'],
          'image/png': ['89504e47'],
          'image/gif': ['474946'],
          'video/mp4': ['00000020667479704d534e56', '000000186674797033677035'],
          'application/pdf': ['255044462d']
        };

        const expectedSignatures = validSignatures[file.type] || [];
        const isValid = expectedSignatures.some(sig => 
          signature.toLowerCase().startsWith(sig.toLowerCase())
        );

        resolve(isValid);
      };

      reader.onerror = () => resolve(false);
      
      // Read first 20 bytes for signature check
      reader.readAsArrayBuffer(file.slice(0, 20));
    });
  }

  /**
   * Get file warnings (non-blocking issues)
   * @param {File} file - File to check
   * @returns {string[]} Array of warnings
   */
  getFileWarnings(file) {
    const warnings = [];

    // Large file warning
    if (file.size > 10 * 1024 * 1024) {
      warnings.push('Large files may take longer to upload and process');
    }

    // Unusual dimensions for images (if available)
    if (file.type.startsWith('image/')) {
      // This would require loading the image to check dimensions
      // For now, we'll skip this check
    }

    return warnings;
  }

  /**
   * Validate and sanitize search queries
   * @param {string} query - Search query
   * @returns {Object} Validation result
   */
  validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
      return { valid: false, error: 'Invalid query' };
    }

    // Remove potentially dangerous characters
    const sanitized = query
      .replace(/[<>'"]/g, '') // Remove HTML-like characters
      .replace(/[(){}[\]]/g, '') // Remove brackets that could be used for injection
      .trim();

    // Check length
    if (sanitized.length < 2) {
      return { valid: false, error: 'Query too short (minimum 2 characters)' };
    }

    if (sanitized.length > 100) {
      return { valid: false, error: 'Query too long (maximum 100 characters)' };
    }

    // Check for SQL injection patterns (basic client-side check)
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /exec\s*\(/i,
      /script\s*:/i
    ];

    if (sqlPatterns.some(pattern => pattern.test(sanitized))) {
      return { valid: false, error: 'Invalid query format' };
    }

    return { valid: true, sanitized };
  }

  /**
   * Generate Content Security Policy nonce
   * @returns {string} CSP nonce
   */
  generateCSPNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if current page is loaded over HTTPS
   * @returns {boolean} Whether connection is secure
   */
  isSecureConnection() {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Validate JWT token format (client-side basic check)
   * @param {string} token - JWT token
   * @returns {Object} Validation result
   */
  validateJWTFormat(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Invalid token format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT structure' };
    }

    try {
      // Basic base64 validation
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid token encoding' };
    }
  }

  /**
   * Generate secure random string for CSRF tokens, etc.
   * @param {number} length - Length of random string
   * @returns {string} Random string
   */
  generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => 
      byte.toString(36).padStart(2, '0')
    ).join('').slice(0, length);
  }
}

/**
 * Input Validation Utilities
 */
export class InputValidator {
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  }

  /**
   * Validate display name
   * @param {string} name - Display name to validate
   * @returns {Object} Validation result
   */
  static validateDisplayName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Display name is required' };
    }

    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      return { valid: false, error: 'Display name must be at least 2 characters' };
    }

    if (trimmed.length > 50) {
      return { valid: false, error: 'Display name must be less than 50 characters' };
    }

    // Allow letters, numbers, spaces, and common special characters
    const validPattern = /^[a-zA-Z0-9\s\-_'.]+$/;
    if (!validPattern.test(trimmed)) {
      return { valid: false, error: 'Display name contains invalid characters' };
    }

    // Check for inappropriate content (basic check)
    const inappropriateWords = [
      'admin', 'moderator', 'system', 'test', 'null', 'undefined'
    ];
    
    if (inappropriateWords.some(word => 
      trimmed.toLowerCase().includes(word.toLowerCase())
    )) {
      return { valid: false, error: 'Display name contains reserved words' };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validate pronoun input
   * @param {string} pronouns - Pronouns to validate
   * @returns {Object} Validation result
   */
  static validatePronouns(pronouns) {
    if (!pronouns || typeof pronouns !== 'string') {
      return { valid: true, sanitized: '' }; // Pronouns are optional
    }

    const trimmed = pronouns.trim();
    
    if (trimmed.length > 20) {
      return { valid: false, error: 'Pronouns must be less than 20 characters' };
    }

    // Allow letters, forward slashes, and spaces
    const validPattern = /^[a-zA-Z\s\/]+$/;
    if (!validPattern.test(trimmed)) {
      return { valid: false, error: 'Pronouns contain invalid characters' };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validate content length and format
   * @param {string} content - Content to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateContent(content, options = {}) {
    const {
      minLength = 1,
      maxLength = 5000,
      allowHTML = false,
      required = true
    } = options;

    if (!content || typeof content !== 'string') {
      if (required) {
        return { valid: false, error: 'Content is required' };
      }
      return { valid: true, sanitized: '' };
    }

    const trimmed = content.trim();
    
    if (trimmed.length < minLength) {
      return { 
        valid: false, 
        error: `Content must be at least ${minLength} characters` 
      };
    }

    if (trimmed.length > maxLength) {
      return { 
        valid: false, 
        error: `Content must be less than ${maxLength} characters` 
      };
    }

    // Sanitize content based on options
    const security = new SecurityUtils();
    const sanitized = allowHTML ? 
      security.sanitizeHTML(trimmed) : 
      security.sanitizeUserContent(trimmed);

    return { valid: true, sanitized };
  }
}

// Export singleton security utils instance
export const security = new SecurityUtils();

export default { SecurityUtils, InputValidator, security };