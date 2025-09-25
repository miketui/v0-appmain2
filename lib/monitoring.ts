import { NextRequest } from 'next/server'

// Types for monitoring
export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

export interface ErrorEvent {
  message: string
  stack?: string
  url?: string
  userId?: string
  timestamp: Date
  level: 'error' | 'warning' | 'info'
  context?: Record<string, any>
}

export interface SecurityEvent {
  type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access'
  userId?: string
  ip: string
  userAgent?: string
  timestamp: Date
  context?: Record<string, any>
}

// Monitoring Service
class MonitoringService {
  private static instance: MonitoringService
  private metrics: PerformanceMetric[] = []
  private errors: ErrorEvent[] = []
  private securityEvents: SecurityEvent[] = []

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  // Track performance metrics
  trackMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const metricWithTimestamp: PerformanceMetric = {
      ...metric,
      timestamp: new Date()
    }

    this.metrics.push(metricWithTimestamp)

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Send to external monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService('metric', metricWithTimestamp)
    }

    console.log(`[METRIC] ${metric.name}: ${metric.value} ${metric.unit}`, metric.tags)
  }

  // Track errors
  trackError(error: Omit<ErrorEvent, 'timestamp'>): void {
    const errorWithTimestamp: ErrorEvent = {
      ...error,
      timestamp: new Date()
    }

    this.errors.push(errorWithTimestamp)

    // Keep only last 500 errors in memory
    if (this.errors.length > 500) {
      this.errors = this.errors.slice(-500)
    }

    // Send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService('error', errorWithTimestamp)
    }

    console.error(`[ERROR] ${error.level.toUpperCase()}: ${error.message}`, error.context)
  }

  // Track security events
  trackSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const eventWithTimestamp: SecurityEvent = {
      ...event,
      timestamp: new Date()
    }

    this.securityEvents.push(eventWithTimestamp)

    // Keep only last 500 security events in memory
    if (this.securityEvents.length > 500) {
      this.securityEvents = this.securityEvents.slice(-500)
    }

    // Send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService('security', eventWithTimestamp)
    }

    console.warn(`[SECURITY] ${event.type}: IP ${event.ip}`, event.context)
  }

  // Get recent metrics
  getMetrics(minutes = 60): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.metrics.filter(metric => metric.timestamp > cutoff)
  }

  // Get recent errors
  getErrors(minutes = 60): ErrorEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.errors.filter(error => error.timestamp > cutoff)
  }

  // Get recent security events
  getSecurityEvents(minutes = 60): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.securityEvents.filter(event => event.timestamp > cutoff)
  }

  // Send to external monitoring service (Sentry, DataDog, etc.)
  private async sendToExternalService(type: string, data: any): Promise<void> {
    try {
      // Example: Send to Sentry
      if (process.env.SENTRY_DSN && type === 'error') {
        // Would integrate with Sentry SDK here
        // Sentry.captureException(new Error(data.message), { extra: data.context })
      }

      // Example: Send to custom webhook
      if (process.env.MONITORING_WEBHOOK_URL) {
        await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'haus-of-basquiat',
            type,
            data,
            timestamp: new Date().toISOString()
          })
        })
      }

      // Example: Send to DataDog
      if (process.env.DATADOG_API_KEY) {
        // Would integrate with DataDog API here
      }
    } catch (error) {
      console.error('Failed to send to external monitoring service:', error)
    }
  }

  // Health check
  getHealthStatus() {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const recentErrors = this.errors.filter(error => error.timestamp > oneMinuteAgo)
    const recentSecurityEvents = this.securityEvents.filter(event => event.timestamp > fiveMinutesAgo)

    // Calculate average response time
    const responseTimeMetrics = this.metrics.filter(
      metric => metric.name === 'response_time' && metric.timestamp > fiveMinutesAgo
    )
    const avgResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, metric) => sum + metric.value, 0) / responseTimeMetrics.length
      : 0

    // Determine health status
    let status = 'healthy'
    let issues: string[] = []

    if (recentErrors.filter(e => e.level === 'error').length > 10) {
      status = 'unhealthy'
      issues.push('High error rate')
    }

    if (avgResponseTime > 2000) { // 2 seconds
      status = status === 'healthy' ? 'degraded' : 'unhealthy'
      issues.push('Slow response times')
    }

    if (recentSecurityEvents.length > 50) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy'
      issues.push('High security event rate')
    }

    return {
      status,
      issues,
      metrics: {
        errors_1min: recentErrors.length,
        security_events_5min: recentSecurityEvents.length,
        avg_response_time_5min: Math.round(avgResponseTime),
        total_metrics: this.metrics.length,
        total_errors: this.errors.length
      },
      timestamp: now.toISOString()
    }
  }
}

// Middleware to track request metrics
export function createMetricsMiddleware() {
  return (request: NextRequest) => {
    const startTime = Date.now()
    const monitoring = MonitoringService.getInstance()

    // Track request start
    monitoring.trackMetric({
      name: 'request_started',
      value: 1,
      unit: 'count',
      tags: {
        method: request.method,
        path: request.nextUrl.pathname
      }
    })

    // Return a function to call when request completes
    return (statusCode?: number, error?: Error) => {
      const duration = Date.now() - startTime

      // Track response time
      monitoring.trackMetric({
        name: 'response_time',
        value: duration,
        unit: 'ms',
        tags: {
          method: request.method,
          path: request.nextUrl.pathname,
          status_code: statusCode?.toString()
        }
      })

      // Track status code
      if (statusCode) {
        monitoring.trackMetric({
          name: 'http_requests_total',
          value: 1,
          unit: 'count',
          tags: {
            method: request.method,
            path: request.nextUrl.pathname,
            status_code: statusCode.toString(),
            status_class: Math.floor(statusCode / 100) + 'xx'
          }
        })
      }

      // Track error if present
      if (error) {
        monitoring.trackError({
          message: error.message,
          stack: error.stack,
          url: request.url,
          level: 'error',
          context: {
            method: request.method,
            path: request.nextUrl.pathname,
            userAgent: request.headers.get('user-agent'),
            ip: request.ip || request.headers.get('x-forwarded-for')
          }
        })
      }
    }
  }
}

// Utility functions for components
export function trackPageView(pageName: string, userId?: string): void {
  const monitoring = MonitoringService.getInstance()
  monitoring.trackMetric({
    name: 'page_view',
    value: 1,
    unit: 'count',
    tags: {
      page: pageName,
      user_id: userId
    }
  })
}

export function trackUserAction(action: string, userId?: string, context?: Record<string, any>): void {
  const monitoring = MonitoringService.getInstance()
  monitoring.trackMetric({
    name: 'user_action',
    value: 1,
    unit: 'count',
    tags: {
      action,
      user_id: userId,
      ...context
    }
  })
}

export function trackError(error: Error, context?: Record<string, any>): void {
  const monitoring = MonitoringService.getInstance()
  monitoring.trackError({
    message: error.message,
    stack: error.stack,
    level: 'error',
    context
  })
}

export function trackSecurityEvent(
  type: SecurityEvent['type'],
  request: NextRequest,
  context?: Record<string, any>
): void {
  const monitoring = MonitoringService.getInstance()
  monitoring.trackSecurityEvent({
    type,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    context
  })
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance()
export default monitoring