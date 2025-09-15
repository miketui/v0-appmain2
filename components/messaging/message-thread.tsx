"use client"

import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/use-socket'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Image, Paperclip, Reply, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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
  readBy?: Array<{
    userId: string
    readAt: string
  }>
}

interface MessageThreadProps {
  conversationId: string
  title?: string
  participants?: Array<{
    id: string
    displayName: string
    avatar?: string
    status?: 'online' | 'away' | 'busy' | 'offline'
  }>
}

export function MessageThread({ conversationId, title, participants = [] }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  
  const { user } = useAuth()
  const { 
    messages, 
    typingUsers, 
    isConnected, 
    sendMessage, 
    joinConversation, 
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead
  } = useSocket()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  
  const conversationMessages = messages.filter(m => m.conversationId === conversationId)
  const conversationTypingUsers = typingUsers.filter(u => u.userId !== user?.id)

  useEffect(() => {
    joinConversation(conversationId)
    return () => leaveConversation(conversationId)
  }, [conversationId, joinConversation, leaveConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return

    sendMessage({
      conversationId,
      content: newMessage.trim(),
      type: 'text',
      replyToId: replyTo?.id
    })

    setNewMessage('')
    setReplyTo(null)
    stopTyping(conversationId)
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      startTyping(conversationId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTyping(conversationId)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  const getParticipantStatus = (userId: string) => {
    const participant = participants.find(p => p.id === userId)
    return participant?.status || 'offline'
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{title || 'Conversation'}</h3>
            <div className="flex items-center gap-2 mt-1">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-1">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xs">
                      {participant.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {participant.displayName}
                  </span>
                  <Badge 
                    variant={getParticipantStatus(participant.id) === 'online' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {getParticipantStatus(participant.id)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {conversationMessages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={message.sender?.avatar} />
                  <AvatarFallback>
                    {message.sender?.displayName?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[70%] ${message.senderId === user?.id ? 'text-right' : ''}`}>
                  {message.replyToId && (
                    <div className="text-xs text-muted-foreground mb-1 p-2 bg-muted rounded">
                      Replying to previous message
                    </div>
                  )}
                  
                  <div
                    className={`p-3 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {getMessageTime(message.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(message)}
                      className="h-6 px-2 text-xs"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    
                    {message.readBy && message.readBy.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Read by {message.readBy.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {conversationTypingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                Someone is typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {replyTo && (
            <div className="flex items-center justify-between bg-muted p-2 rounded mb-2">
              <span className="text-sm">Replying to: {replyTo.content.slice(0, 50)}...</span>
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                ×
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Image className="w-4 h-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={!isConnected}
            />
            
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}