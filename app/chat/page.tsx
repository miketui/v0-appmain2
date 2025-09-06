"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"
import { NewChatModal } from "@/components/chat/new-chat-modal"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

interface ChatThread {
  id: string
  name?: string
  thread_type: "direct" | "group"
  participants: Array<{
    id: string
    display_name: string
    avatar_url?: string
    house?: { name: string }
  }>
  last_message?: {
    id: string
    content: string
    sender_id: string
    message_type: "text" | "image" | "file"
    created_at: string
  }
  last_message_at: string
  unread_count: number
  created_at: string
}

interface Message {
  id: string
  thread_id: string
  sender_id: string
  content?: string
  message_type: "text" | "image" | "file"
  file_url?: string
  sender: {
    id: string
    display_name: string
    avatar_url?: string
  }
  created_at: string
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      loadThreads()
    }
  }, [authLoading, user])

  const loadThreads = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getChats()
      setThreads(response.threads || [])
    } catch (error) {
      console.error("Error loading threads:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (threadId: string) => {
    try {
      setMessagesLoading(true)
      const response = await apiClient.getMessages(threadId)
      setMessages(response.messages || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleThreadSelect = (thread: ChatThread) => {
    setSelectedThread(thread)
    loadMessages(thread.id)
  }

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedThread || !user) return

    try {
      const response = await apiClient.sendMessage(selectedThread.id, content, attachments)
      const newMessage = response.message

      // Add message to local state
      setMessages((prev) => [...prev, newMessage])

      // Update thread's last message
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === selectedThread.id
            ? {
                ...thread,
                last_message: newMessage,
                last_message_at: newMessage.created_at,
              }
            : thread,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleNewThread = (thread: ChatThread) => {
    setThreads((prev) => [thread, ...prev])
    setSelectedThread(thread)
    setMessages([])
    setShowNewChat(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900">
        <div className="flex items-center gap-3 text-gold-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading conversations...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900">
        <Card className="w-full max-w-md bg-black/80 border-gold-500/20">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold text-gold-400 mb-2">Sign In Required</h2>
            <p className="text-gray-300">Please sign in to access your messages.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Messages
          </h1>
          <p className="text-gray-300">Connect with your community members</p>
        </div>

        <div className="h-[calc(100vh-12rem)] flex bg-black/80 border border-gold-500/20 rounded-lg backdrop-blur-sm overflow-hidden">
          {/* Sidebar */}
          <ChatSidebar
            threads={threads}
            selectedThread={selectedThread}
            onThreadSelect={handleThreadSelect}
            onNewChat={() => setShowNewChat(true)}
            currentUser={user}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <ChatWindow
                thread={selectedThread}
                messages={messages}
                messagesLoading={messagesLoading}
                onSendMessage={handleSendMessage}
                currentUser={user}
                onBack={() => setSelectedThread(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gold-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gold-400 mb-2">Select a conversation</h3>
                  <p className="text-gray-300">Choose a chat from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <NewChatModal
            isOpen={showNewChat}
            onClose={() => setShowNewChat(false)}
            onThreadCreated={handleNewThread}
            currentUser={user}
          />
        )}
      </div>
    </div>
  )
}
