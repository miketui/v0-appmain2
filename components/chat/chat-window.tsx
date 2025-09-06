"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Paperclip, MoreVertical, Users, Loader2 } from "lucide-react"
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
}

interface Message {
  id: string
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

interface ChatWindowProps {
  thread: ChatThread
  messages: Message[]
  messagesLoading: boolean
  onSendMessage: (content: string, attachments?: File[]) => void
  currentUser: User
  onBack: () => void
}

export function ChatWindow({ thread, messages, messagesLoading, onSendMessage, currentUser, onBack }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getThreadDisplayName = () => {
    if (thread.name) return thread.name

    const otherParticipants = thread.participants.filter((p) => p.id !== currentUser.id)
    if (otherParticipants.length === 1) {
      return otherParticipants[0].display_name
    }
    return otherParticipants.map((p) => p.display_name).join(", ")
  }

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await onSendMessage(newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <Avatar className="w-10 h-10 border-2 border-gold-500/20">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white">
              {thread.thread_type === "group" ? (
                <Users className="w-5 h-5" />
              ) : (
                getThreadDisplayName()[0]?.toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium text-white">{getThreadDisplayName()}</h3>
            <p className="text-sm text-gray-400">
              {thread.thread_type === "group" ? `${thread.participants.length} members` : "Online"}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gold-400 mb-2">Start the conversation</h3>
            <p className="text-gray-400">Send a message to begin chatting with {getThreadDisplayName()}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
                  {message.sender_id !== currentUser.id && (
                    <Avatar className="w-8 h-8 border border-gold-500/20">
                      <AvatarImage src={message.sender.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white text-xs">
                        {message.sender.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.sender_id === currentUser.id
                        ? "bg-gradient-to-r from-gold-500 to-purple-600 text-white"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {message.sender_id !== currentUser.id && thread.thread_type === "group" && (
                      <p className="text-xs font-medium mb-1 opacity-75">{message.sender.display_name}</p>
                    )}

                    {message.message_type === "image" && message.file_url && (
                      <img
                        src={message.file_url || "/placeholder.svg"}
                        alt="Shared image"
                        className="max-w-full h-auto rounded mb-2 cursor-pointer"
                        onClick={() => window.open(message.file_url, "_blank")}
                      />
                    )}

                    {message.message_type === "file" && message.file_url && (
                      <div className="flex items-center gap-2 mb-2">
                        <Paperclip className="w-4 h-4" />
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                        >
                          Download File
                        </a>
                      </div>
                    )}

                    {message.content && <p className="text-sm">{message.content}</p>}

                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === currentUser.id ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gold-500/20">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[40px] max-h-[120px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500 resize-none"
              rows={1}
            />
          </div>

          <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gold-400"
            disabled
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </>
  )
}
