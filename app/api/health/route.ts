import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      node_version: process.version,
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
      },
      environment: process.env.NODE_ENV || 'development',
    }

    // Optional: Add database connectivity check
    // if (process.env.DATABASE_URL) {
    //   try {
    //     // Add your database ping/connection test here
    //     healthStatus.database = 'connected'
    //   } catch (error) {
    //     healthStatus.database = 'disconnected'
    //     healthStatus.status = 'degraded'
    //   }
    // }

    // Optional: Add external service checks
    // if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    //   try {
    //     // Add Supabase connectivity check here
    //     healthStatus.supabase = 'connected'
    //   } catch (error) {
    //     healthStatus.supabase = 'disconnected'
    //     healthStatus.status = 'degraded'
    //   }
    // }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}