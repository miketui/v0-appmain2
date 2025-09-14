"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PostComposer } from "@/components/feed/post-composer"
import { PostCard } from "@/components/feed/post-card"
import { FeedFilters } from "@/components/feed/feed-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

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

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [feedFilter, setFeedFilter] = useState<"all" | "house" | "following">("all")
  const [showComposer, setShowComposer] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      loadPosts()
    }
  }, [feedFilter, authLoading, user])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const response = (await apiClient.getPosts(1, 20)) as any
      setPosts(response?.posts || [])
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev])
    setShowComposer(false)
  }

  const handleLike = async (postId: string) => {
    try {
      await apiClient.likePost(postId)
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_liked: !post.user_liked,
                likes_count: post.user_liked ? post.likes_count - 1 : post.likes_count + 1,
              }
            : post,
        ),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900">
        <div className="flex items-center gap-3 text-gold-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading community feed...</span>
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
            <p className="text-gray-300">Please sign in to view the community feed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Community Feed
          </h1>
          <p className="text-gray-300">
            Welcome back, {user.profile?.display_name || user.email}! Share your journey with the Haus.
          </p>
        </div>

        {/* Feed Controls */}
        <FeedFilters
          currentFilter={feedFilter}
          onFilterChange={setFeedFilter}
          onCreatePost={() => setShowComposer(true)}
          userHouse={user.profile?.house_id}
        />

        {/* Post Composer */}
        {showComposer && (
          <PostComposer user={user} onPostCreated={handlePostCreated} onCancel={() => setShowComposer(false)} />
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="bg-black/80 border-gold-500/20">
              <CardContent className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gold-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gold-400 mb-2">No posts yet</h3>
                <p className="text-gray-300 mb-4">Be the first to share something with the community!</p>
                <Button
                  onClick={() => setShowComposer(true)}
                  className="bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700"
                >
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} currentUser={user} onLike={handleLike} />)
          )}
        </div>

        {/* Load More */}
        {posts.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              className="border-gold-500/20 text-gold-400 hover:bg-gold-500/10 bg-transparent"
              onClick={loadPosts}
            >
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
