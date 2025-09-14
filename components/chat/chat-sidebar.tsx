"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Users, MessageCircle } from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { User } from "@/lib/auth"

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

interface ChatSidebarProps {
  threads: ChatThread[]
  selectedThread: ChatThread | null
  onThreadSelect: (thread: ChatThread) => void
  onNewChat: () => void
  currentUser: User
}

export function ChatSidebar({ threads, selectedThread, onThreadSelect, onNewChat, currentUser }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const getThreadDisplayName = (thread: ChatThread) => {
    if (thread.name) return thread.name

    const otherParticipants = thread.participants.filter((p) => p.id !== currentUser.id)
    if (otherParticipants.length === 1) {
      return otherParticipants[0].display_name
    }
    return otherParticipants.map((p) => p.display_name).join(", ")
  }

  const getThreadAvatar = (thread: ChatThread) => {
    const otherParticipants = thread.participants.filter((p) => p.id !== currentUser.id)
    if (thread.thread_type === "direct" && otherParticipants.length === 1) {
      return otherParticipants[0].avatar_url
    }
    return null
  }

  const getLastMessagePreview = (thread: ChatThread) => {
    if (!thread.last_message) return "No messages yet"

    switch (thread.last_message.message_type) {
      case "image":
        return "📷 Image"
      case "file":
        return "📎 File"
      default:
        return thread.last_message.content
    }
  }

  const filteredThreads = threads.filter((thread) =>
    getThreadDisplayName(thread).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full md:w-80 border-r border-gold-500/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gold-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gold-400">Messages</h2>
          <Button
            size="sm"
            onClick={onNewChat}
            className="bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No conversations yet</h3>
            <p className="text-gray-400 mb-4">Start connecting with community members</p>
            <Button
              onClick={onNewChat}
              className="bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700"
            >
              Start Chatting
            </Button>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onThreadSelect(thread)}
              className={`p-4 border-b border-gray-700/50 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                selectedThread?.id === thread.id ? "bg-gold-500/10 border-gold-500/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-gold-500/20">
                    <AvatarImage src={getThreadAvatar(thread) || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white">
                      {thread.thread_type === "group" ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        getThreadDisplayName(thread)[0]?.toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {thread.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{thread.unread_count}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white truncate">{getThreadDisplayName(thread)}</h3>
                    {thread.last_message && (
                      <span className="text-xs text-gray-400">{formatTime(thread.last_message.created_at)}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 truncate">{getLastMessagePreview(thread)}</p>

                  {thread.thread_type === "group" && (
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{thread.participants.length} members</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
