"use client"

import { useState } from 'react'
import { MessageThread } from '@/components/messaging/message-thread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Search, Users } from 'lucide-react'

interface Conversation {
  id: string
  title?: string
  type: 'direct' | 'group' | 'house'
  participants: Array<{
    id: string
    displayName: string
    avatar?: string
    status?: 'online' | 'away' | 'busy' | 'offline'
  }>
  lastMessage?: {
    content: string
    timestamp: string
    senderId: string
  }
  unreadCount: number
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with real data from your API
  const conversations: Conversation[] = [
    {
      id: 'conv_1',
      title: 'House of Revlon',
      type: 'house',
      participants: [
        { id: 'user_1', displayName: 'Miss Tina', avatar: '', status: 'online' },
        { id: 'user_2', displayName: 'Pepper LaBeija', avatar: '', status: 'away' },
        { id: 'user_3', displayName: 'Angie Xtravaganza', avatar: '', status: 'online' },
      ],
      lastMessage: {
        content: 'Y\'all ready for tonight\'s ball?',
        timestamp: '2024-01-15T10:30:00Z',
        senderId: 'user_1'
      },
      unreadCount: 3
    },
    {
      id: 'conv_2',
      type: 'direct',
      participants: [
        { id: 'user_4', displayName: 'Crystal LaBeija', avatar: '', status: 'online' },
      ],
      lastMessage: {
        content: 'Can you help me with my runway walk?',
        timestamp: '2024-01-15T09:15:00Z',
        senderId: 'user_4'
      },
      unreadCount: 1
    },
    {
      id: 'conv_3',
      title: 'Vogue Legends',
      type: 'group',
      participants: [
        { id: 'user_5', displayName: 'Willi Ninja', avatar: '', status: 'offline' },
        { id: 'user_6', displayName: 'Jose Gutierez', avatar: '', status: 'busy' },
        { id: 'user_7', displayName: 'Paris Dupree', avatar: '', status: 'online' },
      ],
      lastMessage: {
        content: 'The documentary is amazing! 🔥',
        timestamp: '2024-01-14T20:45:00Z',
        senderId: 'user_7'
      },
      unreadCount: 0
    }
  ]

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => 
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title
    if (conversation.type === 'direct') {
      return conversation.participants[0]?.displayName || 'Direct Message'
    }
    return `Group (${conversation.participants.length})`
  }

  const getLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString()
  }

  return (
    <div className="h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map(conversation => (
              <Card
                key={conversation.id}
                className={`mb-2 cursor-pointer transition-colors hover:bg-accent ${
                  selectedConversation === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {conversation.type === 'direct' ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.participants[0]?.avatar} />
                          <AvatarFallback>
                            {conversation.participants[0]?.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      
                      {conversation.type === 'direct' && conversation.participants[0]?.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">
                          {getConversationTitle(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {getLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {conversation.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {conversation.participants.length} member{conversation.participants.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className="flex-1">
        {selectedConversation ? (
          <MessageThread
            conversationId={selectedConversation}
            title={getConversationTitle(
              conversations.find(c => c.id === selectedConversation)!
            )}
            participants={
              conversations.find(c => c.id === selectedConversation)?.participants || []
            }
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}