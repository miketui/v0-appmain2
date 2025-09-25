import { NextRequest, NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'

// Force dynamic behavior for monitoring endpoint
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minutes = parseInt(searchParams.get('minutes') || '60')
    const type = searchParams.get('type') || 'all'

    // Get monitoring data
    let data: any = {}

    switch (type) {
      case 'health':
        data = monitoring.getHealthStatus()
        break
      case 'metrics':
        data = {
          metrics: monitoring.getMetrics(minutes),
          summary: getMetricsSummary(monitoring.getMetrics(minutes))
        }
        break
      case 'errors':
        data = {
          errors: monitoring.getErrors(minutes),
          summary: getErrorsSummary(monitoring.getErrors(minutes))
        }
        break
      case 'security':
        data = {
          events: monitoring.getSecurityEvents(minutes),
          summary: getSecuritySummary(monitoring.getSecurityEvents(minutes))
        }
        break
      default:
        data = {
          health: monitoring.getHealthStatus(),
          metrics: monitoring.getMetrics(minutes),
          errors: monitoring.getErrors(minutes),
          security: monitoring.getSecurityEvents(minutes)
        }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'metric':
        monitoring.trackMetric(data)
        break
      case 'error':
        monitoring.trackError(data)
        break
      case 'security':
        monitoring.trackSecurityEvent(data)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid monitoring event type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Monitoring POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process monitoring data' },
      { status: 500 }
    )
  }
}

// Helper functions
function getMetricsSummary(metrics: any[]) {
  const summary: any = {}

  metrics.forEach(metric => {
    if (!summary[metric.name]) {
      summary[metric.name] = {
        count: 0,
        total: 0,
        min: metric.value,
        max: metric.value,
        avg: 0
      }
    }

    const s = summary[metric.name]
    s.count++
    s.total += metric.value
    s.min = Math.min(s.min, metric.value)
    s.max = Math.max(s.max, metric.value)
    s.avg = s.total / s.count
  })

  return summary
}

function getErrorsSummary(errors: any[]) {
  const byLevel = errors.reduce((acc, error) => {
    acc[error.level] = (acc[error.level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byHour = errors.reduce((acc, error) => {
    const hour = new Date(error.timestamp).toISOString().split('T')[1].split(':')[0]
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: errors.length,
    byLevel,
    byHour,
    recentMessages: errors.slice(-10).map(e => ({
      message: e.message,
      level: e.level,
      timestamp: e.timestamp
    }))
  }
}

function getSecuritySummary(events: any[]) {
  const byType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const uniqueIPs = new Set(events.map(e => e.ip)).size

  return {
    total: events.length,
    byType,
    uniqueIPs,
    recentEvents: events.slice(-10).map(e => ({
      type: e.type,
      ip: e.ip,
      timestamp: e.timestamp
    }))
  }
}