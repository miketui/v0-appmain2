import { NextRequest } from 'next/server'
import { initSocket } from '@/lib/socket'

export async function GET(req: NextRequest) {
  // This route is handled by the Socket.IO server
  // The actual Socket.IO server should be initialized in a separate server file
  return new Response('Socket.IO server endpoint', { status: 200 })
}

export async function POST(req: NextRequest) {
  // Handle Socket.IO HTTP fallback if needed
  return new Response('Socket.IO HTTP fallback', { status: 200 })
}