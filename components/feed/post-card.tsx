"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Globe, Users, Home, MoreVertical } from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { User } from "@/lib/auth"

interface Post {
  id: string
  content: string
  author: {
    id: string
    display_name: string
    avatar_url?: string
    house?: {
      name: string
    }
  }
  likes_count: number
  comments_count: number
  visibility: "public" | "members_only" | "house_only"
  media_urls?: string[]
  created_at: string
  user_liked?: boolean
}

interface PostCardProps {
  post: Post
  currentUser: User
  onLike: (postId: string) => void
}

export function PostCard({ post, currentUser, onLike }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "house_only":
        return <Home className="w-4 h-4 text-purple-400" />
      case "members_only":
        return <Users className="w-4 h-4 text-blue-400" />
      default:
        return <Globe className="w-4 h-4 text-green-400" />
    }
  }

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "house_only":
        return "House Only"
      case "members_only":
        return "Members Only"
      default:
        return "Public"
    }
  }

  const getRoleBadgeColor = (houseName?: string) => {
    if (!houseName) return "bg-gray-500/20 text-gray-400"

    // Different colors for different houses
    const colors = {
      "House of Eleganza": "bg-pink-500/20 text-pink-400",
      "House of Avant-Garde": "bg-purple-500/20 text-purple-400",
      "House of Butch Realness": "bg-blue-500/20 text-blue-400",
      "House of Femme": "bg-rose-500/20 text-rose-400",
      "House of Bizarre": "bg-orange-500/20 text-orange-400",
    }

    return colors[houseName as keyof typeof colors] || "bg-gold-500/20 text-gold-400"
  }

  return (
    <Card className="bg-black/80 border-gold-500/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-gold-500/20">
              <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white">
                {post.author.display_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{post.author.display_name}</h3>
                {post.author.house && (
                  <Badge className={`text-xs px-2 py-1 ${getRoleBadgeColor(post.author.house.name)}`}>
                    {post.author.house.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{formatTime(post.created_at)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {getVisibilityIcon(post.visibility)}
                  <span>{getVisibilityLabel(post.visibility)}</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>

        {/* Media Gallery */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4">
            <div
              className={`grid gap-2 rounded-lg overflow-hidden ${
                post.media_urls.length === 1
                  ? "grid-cols-1"
                  : post.media_urls.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2"
              }`}
            >
              {post.media_urls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url || "/placeholder.svg"}
                    alt=""
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, "_blank")}
                  />
                  {index === 3 && post.media_urls!.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">+{post.media_urls!.length - 4} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`transition-colors ${
                post.user_liked ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-red-400"
              }`}
            >
              <Heart className={`w-5 h-5 mr-2 ${post.user_liked ? "fill-current" : ""}`} />
              <span>{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span>{post.comments_count}</span>
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400 transition-colors">
              <Share2 className="w-5 h-5 mr-2" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Comments Section - Coming Soon */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">Comments feature coming soon...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
