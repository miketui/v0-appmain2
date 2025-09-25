import { monitoring, ErrorEvent, SecurityEvent, PerformanceMetric } from './monitoring'

export interface AlertRule {
  id: string
  name: string
  description: string
  type: 'metric' | 'error_rate' | 'security' | 'health'
  condition: AlertCondition
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldown: number // minutes
}

export interface AlertCondition {
  metric?: string
  threshold?: number
  operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  timeWindow?: number // minutes
  count?: number
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  context?: Record<string, any>
}

class AlertingService {
  private static instance: AlertingService
  private alerts: Alert[] = []
  private rules: AlertRule[] = []
  private lastAlertTime: Map<string, Date> = new Map()

  static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService()
      AlertingService.instance.initializeDefaultRules()
      AlertingService.instance.startMonitoring()
    }
    return AlertingService.instance
  }

  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'More than 10 errors in 5 minutes',
        type: 'error_rate',
        condition: {
          count: 10,
          timeWindow: 5
        },
        severity: 'high',
        enabled: true,
        cooldown: 15
      },
      {
        id: 'slow_response_time',
        name: 'Slow Response Time',
        description: 'Average response time over 2 seconds',
        type: 'metric',
        condition: {
          metric: 'response_time',
          threshold: 2000,
          operator: 'gt',
          timeWindow: 5
        },
        severity: 'medium',
        enabled: true,
        cooldown: 10
      },
      {
        id: 'security_events_spike',
        name: 'Security Events Spike',
        description: 'More than 20 security events in 10 minutes',
        type: 'security',
        condition: {
          count: 20,
          timeWindow: 10
        },
        severity: 'critical',
        enabled: true,
        cooldown: 30
      },
      {
        id: 'application_unhealthy',
        name: 'Application Unhealthy',
        description: 'Health check status is unhealthy',
        type: 'health',
        condition: {},
        severity: 'critical',
        enabled: true,
        cooldown: 5
      },
      {
        id: 'failed_login_attempts',
        name: 'Failed Login Attempts',
        description: 'Multiple failed login attempts from same IP',
        type: 'security',
        condition: {
          count: 5,
          timeWindow: 15
        },
        severity: 'medium',
        enabled: true,
        cooldown: 30
      }
    ]

    this.rules = defaultRules
  }

  private startMonitoring(): void {
    // Check for alert conditions every minute
    setInterval(() => {
      this.checkAlertRules()
    }, 60 * 1000)
  }

  private checkAlertRules(): void {
    for (const rule of this.rules) {
      if (!rule.enabled) continue

      // Check cooldown
      const lastAlert = this.lastAlertTime.get(rule.id)
      if (lastAlert && (Date.now() - lastAlert.getTime()) < (rule.cooldown * 60 * 1000)) {
        continue
      }

      if (this.evaluateRule(rule)) {
        this.triggerAlert(rule)
      }
    }
  }

  private evaluateRule(rule: AlertRule): boolean {
    const now = new Date()
    const timeWindow = rule.condition.timeWindow || 5
    const cutoff = new Date(now.getTime() - timeWindow * 60 * 1000)

    switch (rule.type) {
      case 'error_rate':
        const errors = monitoring.getErrors(timeWindow)
        return errors.length > (rule.condition.count || 0)

      case 'security':
        const securityEvents = monitoring.getSecurityEvents(timeWindow)

        if (rule.id === 'failed_login_attempts') {
          // Group by IP and check for multiple failures
          const failuresByIP = securityEvents
            .filter(e => e.type === 'failed_login')
            .reduce((acc, event) => {
              acc[event.ip] = (acc[event.ip] || 0) + 1
              return acc
            }, {} as Record<string, number>)

          return Object.values(failuresByIP).some(count => count >= (rule.condition.count || 5))
        }

        return securityEvents.length > (rule.condition.count || 0)

      case 'metric':
        const metrics = monitoring.getMetrics(timeWindow)
        const relevantMetrics = metrics.filter(m => m.name === rule.condition.metric)

        if (relevantMetrics.length === 0) return false

        const avgValue = relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length
        const threshold = rule.condition.threshold || 0

        switch (rule.condition.operator) {
          case 'gt': return avgValue > threshold
          case 'gte': return avgValue >= threshold
          case 'lt': return avgValue < threshold
          case 'lte': return avgValue <= threshold
          case 'eq': return avgValue === threshold
          default: return false
        }

      case 'health':
        const health = monitoring.getHealthStatus()
        return health.status === 'unhealthy'

      default:
        return false
    }
  }

  private triggerAlert(rule: AlertRule): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      message: this.generateAlertMessage(rule),
      severity: rule.severity,
      timestamp: new Date(),
      resolved: false,
      context: this.getAlertContext(rule)
    }

    this.alerts.push(alert)
    this.lastAlertTime.set(rule.id, alert.timestamp)

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000)
    }

    // Send notifications
    this.sendNotification(alert)

    console.warn(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`, alert.context)
  }

  private generateAlertMessage(rule: AlertRule): string {
    const timeWindow = rule.condition.timeWindow || 5

    switch (rule.type) {
      case 'error_rate':
        return `High error rate detected: ${monitoring.getErrors(timeWindow).length} errors in ${timeWindow} minutes`

      case 'security':
        const events = monitoring.getSecurityEvents(timeWindow)
        return `Security alert: ${events.length} security events in ${timeWindow} minutes`

      case 'metric':
        const metrics = monitoring.getMetrics(timeWindow)
        const relevantMetrics = metrics.filter(m => m.name === rule.condition.metric)
        const avgValue = relevantMetrics.length > 0
          ? relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length
          : 0
        return `Metric alert: ${rule.condition.metric} average is ${avgValue.toFixed(2)} (threshold: ${rule.condition.threshold})`

      case 'health':
        const health = monitoring.getHealthStatus()
        return `Health check failed: ${health.issues.join(', ')}`

      default:
        return `Alert triggered: ${rule.name}`
    }
  }

  private getAlertContext(rule: AlertRule): Record<string, any> {
    const timeWindow = rule.condition.timeWindow || 5

    switch (rule.type) {
      case 'error_rate':
        const recentErrors = monitoring.getErrors(timeWindow)
        return {
          error_count: recentErrors.length,
          recent_errors: recentErrors.slice(-5).map(e => ({
            message: e.message,
            level: e.level,
            timestamp: e.timestamp
          }))
        }

      case 'security':
        const recentEvents = monitoring.getSecurityEvents(timeWindow)
        return {
          event_count: recentEvents.length,
          event_types: [...new Set(recentEvents.map(e => e.type))],
          unique_ips: [...new Set(recentEvents.map(e => e.ip))]
        }

      case 'metric':
        const metrics = monitoring.getMetrics(timeWindow)
        const relevantMetrics = metrics.filter(m => m.name === rule.condition.metric)
        return {
          metric_count: relevantMetrics.length,
          avg_value: relevantMetrics.length > 0
            ? relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length
            : 0,
          threshold: rule.condition.threshold
        }

      case 'health':
        return monitoring.getHealthStatus()

      default:
        return {}
    }
  }

  private async sendNotification(alert: Alert): Promise<void> {
    try {
      // Send to Slack webhook
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackNotification(alert)
      }

      // Send email notification (high/critical only)
      if (['high', 'critical'].includes(alert.severity) && process.env.ALERT_EMAIL) {
        await this.sendEmailNotification(alert)
      }

      // Send to custom webhook
      if (process.env.ALERT_WEBHOOK_URL) {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'haus-of-basquiat',
            alert,
            timestamp: new Date().toISOString()
          })
        })
      }

      // Log to Supabase for persistence
      if (process.env.DATABASE_URL) {
        // Would save to database here
      }
    } catch (error) {
      console.error('Failed to send alert notification:', error)
    }
  }

  private async sendSlackNotification(alert: Alert): Promise<void> {
    const color = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8b0000'
    }[alert.severity]

    const payload = {
      text: `🚨 *${alert.severity.toUpperCase()}* Alert: ${alert.ruleName}`,
      attachments: [{
        color,
        fields: [
          {
            title: 'Message',
            value: alert.message,
            short: false
          },
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Timestamp',
            value: alert.timestamp.toISOString(),
            short: true
          }
        ]
      }]
    }

    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  private async sendEmailNotification(alert: Alert): Promise<void> {
    // Would integrate with SendGrid or similar email service
    console.log('Email notification would be sent:', alert)
  }

  // Public methods
  getAlerts(resolved = false): Alert[] {
    return this.alerts.filter(alert => alert.resolved === resolved)
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      return true
    }
    return false
  }

  getRules(): AlertRule[] {
    return this.rules
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
      return true
    }
    return false
  }

  addRule(rule: AlertRule): void {
    this.rules.push(rule)
  }

  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId)
    if (index >= 0) {
      this.rules.splice(index, 1)
      return true
    }
    return false
  }
}

export const alerting = AlertingService.getInstance()
export default alerting