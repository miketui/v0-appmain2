"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Search, Users, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { User } from "@/lib/auth"

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onThreadCreated: (thread: any) => void
  currentUser: User
}

interface UserProfile {
  id: string
  display_name: string
  avatar_url?: string
  role: string
  house?: { name: string }
}

export function NewChatModal({ isOpen, onClose, onThreadCreated, currentUser }: NewChatModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = (await apiClient.getUsers("")) as any
      const list = (response?.users || []) as UserProfile[]
      setUsers(list.filter((user: UserProfile) => user.id !== currentUser.id))
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateThread = async () => {
    if (selectedUsers.length === 0 || creating) return

    setCreating(true)
    try {
      // This would need to be implemented in the API client
      const response = await fetch("/api/chat/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          participantIds: selectedUsers.map((u) => u.id),
          threadType: selectedUsers.length > 1 ? "group" : "direct",
          name: selectedUsers.length > 1 ? selectedUsers.map((u) => u.display_name).join(", ") : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to create thread")

      const data = await response.json()
      onThreadCreated(data.thread)
    } catch (error) {
      console.error("Error creating thread:", error)
    } finally {
      setCreating(false)
    }
  }

  const getAuthToken = async () => {
    // This would need to be implemented to get the current auth token
    return "token"
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedUsers.some((su) => su.id === user.id),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400"
      case "leader":
        return "bg-purple-500/20 text-purple-400"
      case "member":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-black/90 border border-gold-500/20 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gold-400">New Conversation</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{user.display_name}</span>
                    <button
                      onClick={() => setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id))}
                      className="text-gold-400 hover:text-gold-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-lg">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p>No members found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUsers((prev) => [...prev, user])}
                  className="p-3 hover:bg-gray-800/50 cursor-pointer border-b border-gray-700/50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-gold-500/20">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white">
                        {user.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{user.display_name}</p>
                        <Badge className={`text-xs px-2 py-1 ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
                      </div>
                      {user.house && <p className="text-sm text-gray-400">{user.house.name}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateThread}
              disabled={selectedUsers.length === 0 || creating}
              className="flex-1 bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700"
            >
              {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {creating ? "Creating..." : "Start Chat"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
