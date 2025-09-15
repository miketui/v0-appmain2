"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './use-auth'

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file'
  replyToId?: string
  createdAt: string
  sender?: {
    id: string
    displayName: string
    avatar?: string
  }
}

interface TypingUser {
  userId: string
  isTyping: boolean
}

interface UserStatus {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(new Map())
  
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user) return

    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket/io',
      auth: {
        token: user.token, // Assuming user object has a token
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socketInstance
    setSocket(socketInstance)

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setIsConnected(false)
    })

    // Message events
    socketInstance.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('message-sent', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('message-error', (error: { error: string }) => {
      console.error('Message error:', error.error)
    })

    // Typing events
    socketInstance.on('user-typing', (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId)
        if (data.isTyping) {
          return [...filtered, data]
        }
        return filtered
      })
    })

    // Status events
    socketInstance.on('user-status-changed', (status: UserStatus) => {
      setUserStatuses(prev => new Map(prev.set(status.userId, status)))
    })

    // Read receipt events
    socketInstance.on('message-read', (data: { messageId: string; readBy: string; readAt: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, readBy: [...(msg.readBy || []), { userId: data.readBy, readAt: data.readAt }] }
          : msg
      ))
    })

    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [user])

  const sendMessage = (data: {
    conversationId: string
    content: string
    type: 'text' | 'image' | 'file'
    replyToId?: string
  }) => {
    if (socket && isConnected) {
      socket.emit('send-message', data)
    }
  }

  const joinConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join-conversation', conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-conversation', conversationId)
    }
  }

  const startTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-start', conversationId)
    }
  }

  const stopTyping = (conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', conversationId)
    }
  }

  const markAsRead = (conversationId: string, messageId: string) => {
    if (socket && isConnected) {
      socket.emit('mark-read', { conversationId, messageId })
    }
  }

  const updateStatus = (status: 'online' | 'away' | 'busy' | 'offline') => {
    if (socket && isConnected) {
      socket.emit('update-status', status)
    }
  }

  return {
    socket,
    isConnected,
    messages,
    typingUsers,
    userStatuses,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead,
    updateStatus,
  }
}