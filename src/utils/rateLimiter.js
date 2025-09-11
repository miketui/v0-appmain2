/**
 * Client-side rate limiting utility
 * Provides protection against rapid-fire API calls and abuse
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.cleanup();
  }

  /**
   * Check if an action is rate limited
   * @param {string} key - Unique identifier for the action (e.g., 'api:/posts', 'login:user@email.com')
   * @param {number} limit - Maximum number of requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} { allowed: boolean, resetTime?: number, remaining?: number }
   */
  checkLimit(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    this.requests.set(key, validRequests);
    
    if (validRequests.length >= limit) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + windowMs;
      
      return {
        allowed: false,
        resetTime,
        remaining: 0,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }
    
    // Record this request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: limit - validRequests.length,
      resetTime: now + windowMs
    };
  }

  /**
   * Record a successful request
   * @param {string} key - Action identifier
   */
  recordRequest(key) {
    const now = Date.now();
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    this.requests.get(key).push(now);
  }

  /**
   * Clear rate limiting data for a specific key
   * @param {string} key - Action identifier
   */
  clearLimit(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limiting data
   */
  clearAll() {
    this.requests.clear();
  }

  /**
   * Periodic cleanup of old entries
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      for (const [key, requests] of this.requests.entries()) {
        const validRequests = requests.filter(timestamp => 
          now - timestamp < maxAge
        );
        
        if (validRequests.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  /**
   * Get current status for debugging
   */
  getStatus() {
    const status = {};
    for (const [key, requests] of this.requests.entries()) {
      status[key] = {
        requestCount: requests.length,
        oldestRequest: requests.length > 0 ? new Date(Math.min(...requests)) : null,
        newestRequest: requests.length > 0 ? new Date(Math.max(...requests)) : null
      };
    }
    return status;
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Rate limiting configurations for different actions
export const RATE_LIMITS = {
  // Authentication
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  PASSWORD_RESET: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  
  // API calls
  POST_CREATE: { limit: 10, windowMs: 60 * 1000 }, // 10 posts per minute
  COMMENT_CREATE: { limit: 30, windowMs: 60 * 1000 }, // 30 comments per minute
  LIKE_ACTION: { limit: 100, windowMs: 60 * 1000 }, // 100 likes per minute
  
  // File uploads
  FILE_UPLOAD: { limit: 20, windowMs: 60 * 1000 }, // 20 files per minute
  LARGE_FILE_UPLOAD: { limit: 5, windowMs: 5 * 60 * 1000 }, // 5 large files per 5 minutes
  
  // Messaging
  MESSAGE_SEND: { limit: 60, windowMs: 60 * 1000 }, // 60 messages per minute
  
  // Search
  SEARCH_QUERY: { limit: 30, windowMs: 60 * 1000 }, // 30 searches per minute
  
  // Administrative
  USER_MANAGEMENT: { limit: 20, windowMs: 60 * 1000 }, // 20 user actions per minute
  MODERATION: { limit: 50, windowMs: 60 * 1000 }, // 50 moderation actions per minute
};

/**
 * Convenience function to check if an action is allowed
 * @param {string} action - Action type from RATE_LIMITS
 * @param {string} identifier - Unique identifier (user ID, IP, etc.)
 * @returns {Object} Rate limit result
 */
export function checkRateLimit(action, identifier = 'anonymous') {
  const config = RATE_LIMITS[action];
  if (!config) {
    console.warn(`Unknown rate limit action: ${action}`);
    return { allowed: true };
  }
  
  const key = `${action}:${identifier}`;
  return rateLimiter.checkLimit(key, config.limit, config.windowMs);
}

/**
 * Record a successful action
 * @param {string} action - Action type
 * @param {string} identifier - Unique identifier
 */
export function recordAction(action, identifier = 'anonymous') {
  const key = `${action}:${identifier}`;
  rateLimiter.recordRequest(key);
}

/**
 * Clear rate limiting for a specific action/user
 * @param {string} action - Action type
 * @param {string} identifier - Unique identifier
 */
export function clearRateLimit(action, identifier = 'anonymous') {
  const key = `${action}:${identifier}`;
  rateLimiter.clearLimit(key);
}

/**
 * Enhanced rate limiting for API requests
 * Considers user role and behavior patterns
 */
export class AdaptiveRateLimiter {
  constructor() {
    this.baseLimiter = rateLimiter;
    this.userBehavior = new Map();
    this.suspiciousIPs = new Set();
  }

  /**
   * Check rate limit with adaptive rules based on user behavior
   * @param {string} action - Action type
   * @param {Object} context - Context including user, IP, etc.
   * @returns {Object} Rate limit result with adaptive adjustments
   */
  checkAdaptiveLimit(action, context = {}) {
    const { userId, userRole, ipAddress, userAgent } = context;
    const baseConfig = RATE_LIMITS[action];
    
    if (!baseConfig) {
      return { allowed: true };
    }

    // Adjust limits based on user role
    let adjustedConfig = { ...baseConfig };
    
    if (userRole === 'Admin') {
      adjustedConfig.limit *= 2; // Admins get 2x limit
    } else if (userRole === 'Leader') {
      adjustedConfig.limit *= 1.5; // Leaders get 1.5x limit
    } else if (userRole === 'Applicant') {
      adjustedConfig.limit *= 0.5; // Applicants get reduced limits
    }

    // Check for suspicious behavior
    if (this.isSuspiciousActivity(context)) {
      adjustedConfig.limit *= 0.1; // Severely limit suspicious users
    }

    // Apply base rate limiting
    const identifier = userId || ipAddress || 'anonymous';
    const key = `${action}:${identifier}`;
    const result = this.baseLimiter.checkLimit(
      key, 
      adjustedConfig.limit, 
      adjustedConfig.windowMs
    );

    // Track user behavior
    this.trackBehavior(context, action, result.allowed);

    return {
      ...result,
      adjustedLimit: adjustedConfig.limit,
      originalLimit: baseConfig.limit,
      reason: this.getRateLimitReason(context, result.allowed)
    };
  }

  /**
   * Detect suspicious activity patterns
   * @param {Object} context - Request context
   * @returns {boolean} Whether activity appears suspicious
   */
  isSuspiciousActivity(context) {
    const { userId, ipAddress, userAgent } = context;
    
    // Check for suspicious IP
    if (this.suspiciousIPs.has(ipAddress)) {
      return true;
    }

    // Check user behavior patterns
    if (userId && this.userBehavior.has(userId)) {
      const behavior = this.userBehavior.get(userId);
      
      // Too many rapid requests across different actions
      if (behavior.rapidRequestCount > 50) {
        return true;
      }
      
      // Unusual patterns (e.g., only automated-looking requests)
      if (behavior.automatedRequestRatio > 0.8) {
        return true;
      }
    }

    // Check for bot-like user agents
    if (userAgent && this.isBotUserAgent(userAgent)) {
      return true;
    }

    return false;
  }

  /**
   * Track user behavior patterns
   * @param {Object} context - Request context
   * @param {string} action - Action performed
   * @param {boolean} allowed - Whether request was allowed
   */
  trackBehavior(context, action, allowed) {
    const { userId, ipAddress } = context;
    const now = Date.now();
    
    if (userId) {
      if (!this.userBehavior.has(userId)) {
        this.userBehavior.set(userId, {
          totalRequests: 0,
          rapidRequestCount: 0,
          automatedRequestRatio: 0,
          lastRequestTime: 0,
          actionCounts: {},
          blocked: 0,
          suspicious: false
        });
      }
      
      const behavior = this.userBehavior.get(userId);
      behavior.totalRequests++;
      
      if (!allowed) {
        behavior.blocked++;
      }
      
      // Track rapid requests
      if (now - behavior.lastRequestTime < 1000) {
        behavior.rapidRequestCount++;
      }
      
      // Track action distribution
      behavior.actionCounts[action] = (behavior.actionCounts[action] || 0) + 1;
      
      // Calculate automation ratio
      const totalActions = Object.keys(behavior.actionCounts).length;
      const maxActionCount = Math.max(...Object.values(behavior.actionCounts));
      behavior.automatedRequestRatio = maxActionCount / behavior.totalRequests;
      
      // Mark as suspicious if too many blocks
      if (behavior.blocked > 10) {
        behavior.suspicious = true;
        if (ipAddress) {
          this.suspiciousIPs.add(ipAddress);
        }
      }
      
      behavior.lastRequestTime = now;
      this.userBehavior.set(userId, behavior);
    }
  }

  /**
   * Check if user agent appears to be a bot
   * @param {string} userAgent - User agent string
   * @returns {boolean} Whether it appears to be a bot
   */
  isBotUserAgent(userAgent) {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /axios/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Get human-readable reason for rate limiting
   * @param {Object} context - Request context
   * @param {boolean} allowed - Whether request was allowed
   * @returns {string} Reason description
   */
  getRateLimitReason(context, allowed) {
    if (allowed) {
      return null;
    }
    
    if (this.isSuspiciousActivity(context)) {
      return 'Request blocked due to suspicious activity patterns';
    }
    
    if (context.userRole === 'Applicant') {
      return 'Rate limit applied to applicant users';
    }
    
    return 'Rate limit exceeded for this action';
  }

  /**
   * Reset behavior tracking for a user (e.g., after admin review)
   * @param {string} userId - User ID to reset
   */
  resetUserBehavior(userId) {
    this.userBehavior.delete(userId);
  }

  /**
   * Mark IP as safe (remove from suspicious list)
   * @param {string} ipAddress - IP address to whitelist
   */
  whitelistIP(ipAddress) {
    this.suspiciousIPs.delete(ipAddress);
  }

  /**
   * Get behavior analytics for admin dashboard
   * @returns {Object} Aggregated behavior data
   */
  getBehaviorAnalytics() {
    const analytics = {
      totalUsers: this.userBehavior.size,
      suspiciousUsers: 0,
      suspiciousIPs: this.suspiciousIPs.size,
      topActions: {},
      averageRequestsPerUser: 0
    };
    
    let totalRequests = 0;
    
    for (const [userId, behavior] of this.userBehavior.entries()) {
      if (behavior.suspicious) {
        analytics.suspiciousUsers++;
      }
      
      totalRequests += behavior.totalRequests;
      
      // Aggregate action counts
      for (const [action, count] of Object.entries(behavior.actionCounts)) {
        analytics.topActions[action] = (analytics.topActions[action] || 0) + count;
      }
    }
    
    analytics.averageRequestsPerUser = totalRequests / Math.max(analytics.totalUsers, 1);
    
    return analytics;
  }
}

// Export singleton adaptive rate limiter
export const adaptiveRateLimiter = new AdaptiveRateLimiter();

export default rateLimiter;