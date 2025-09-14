"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, ImageIcon, Globe, Users, Home, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { User } from "@/lib/auth"

interface PostComposerProps {
  user: User
  onPostCreated: (post: any) => void
  onCancel: () => void
}

export function PostComposer({ user, onPostCreated, onCancel }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [visibility, setVisibility] = useState<"public" | "members_only" | "house_only">("public")
  const [posting, setPosting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || posting) return

    setPosting(true)
    try {
      const response = (await apiClient.createPost({
        content: content.trim(),
        visibility,
        house_id: user.profile?.house_id,
      })) as any

      onPostCreated(response?.post)
      setContent("")
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setPosting(false)
    }
  }

  const getVisibilityIcon = (vis: string) => {
    switch (vis) {
      case "house_only":
        return <Home className="w-4 h-4" />
      case "members_only":
        return <Users className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getVisibilityLabel = (vis: string) => {
    switch (vis) {
      case "house_only":
        return "House Only"
      case "members_only":
        return "Members Only"
      default:
        return "Public"
    }
  }

  return (
    <Card className="bg-black/80 border-gold-500/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gold-400">Share with the Community</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 border-2 border-gold-500/20">
              <AvatarImage src={user.profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white">
                {user.profile?.display_name?.[0] || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in the ballroom community? Share your thoughts, experiences, or celebrate achievements..."
                className="min-h-[120px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-gold-400" disabled>
                <ImageIcon className="w-4 h-4 mr-2" />
                Media (Coming Soon)
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-400" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="members_only">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Members Only</span>
                    </div>
                  </SelectItem>
                  {user.profile?.house_id && (
                    <SelectItem value="house_only">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-purple-400" />
                        <span>House Only</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Button
                type="submit"
                disabled={posting || !content.trim()}
                className="bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
              >
                {posting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="border-gold-500/20 text-gold-400">
              {getVisibilityIcon(visibility)}
              <span className="ml-1">{getVisibilityLabel(visibility)}</span>
            </Badge>
            <span className="text-gray-400">{content.length}/1000 characters</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
