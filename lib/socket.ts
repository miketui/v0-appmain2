import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIo = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const initSocket = (server: NetServer): ServerIO => {
  const io = new ServerIO(server, {
    path: '/api/socket/io',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      // TODO: Validate JWT token here with your auth service
      // const user = await validateToken(token)
      // socket.userId = user.id
      // socket.userRole = user.role

      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join user to their personal room
    socket.join(`user:${socket.userId}`)

    // Handle joining conversation rooms
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`User ${socket.userId} joined conversation ${conversationId}`)
    })

    // Handle leaving conversation rooms
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
      console.log(`User ${socket.userId} left conversation ${conversationId}`)
    })

    // Handle new messages
    socket.on('send-message', async (data: {
      conversationId: string
      content: string
      type: 'text' | 'image' | 'file'
      replyToId?: string
    }) => {
      try {
        // TODO: Save message to database
        const message = {
          id: `msg_${Date.now()}`,
          conversationId: data.conversationId,
          senderId: socket.userId,
          content: data.content,
          type: data.type,
          replyToId: data.replyToId,
          createdAt: new Date().toISOString(),
        }

        // Broadcast to conversation participants
        socket.to(`conversation:${data.conversationId}`).emit('new-message', message)
        socket.emit('message-sent', message)
      } catch (error) {
        socket.emit('message-error', { error: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing-start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: true,
      })
    })

    socket.on('typing-stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: false,
      })
    })

    // Handle read receipts
    socket.on('mark-read', (data: { conversationId: string; messageId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('message-read', {
        messageId: data.messageId,
        readBy: socket.userId,
        readAt: new Date().toISOString(),
      })
    })

    // Handle user status updates
    socket.on('update-status', (status: 'online' | 'away' | 'busy' | 'offline') => {
      // TODO: Update user status in database
      socket.broadcast.emit('user-status-changed', {
        userId: socket.userId,
        status,
        lastSeen: new Date().toISOString(),
      })
    })

    // Handle admin moderation events
    socket.on('admin-action', (data: {
      type: 'ban' | 'kick' | 'mute' | 'delete-message'
      targetUserId?: string
      messageId?: string
      reason?: string
    }) => {
      // TODO: Verify admin permissions
      if (socket.userRole === 'ADMIN' || socket.userRole === 'LEADER') {
        io.emit('admin-action-performed', {
          action: data.type,
          targetUserId: data.targetUserId,
          messageId: data.messageId,
          reason: data.reason,
          performedBy: socket.userId,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
      // TODO: Update user status to offline in database
      socket.broadcast.emit('user-status-changed', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date().toISOString(),
      })
    })
  })

  return io
}

// Socket.IO types for TypeScript
declare module 'socket.io' {
  interface Socket {
    userId: string
    userRole: string
  }
}