"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PostComposer } from "@/components/feed/post-composer"
import { PostCard } from "@/components/feed/post-card"
import { FeedFilters } from "@/components/feed/feed-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Loader2 } from "lucide-react"
import { apiClient, supabase } from "@/lib/api"

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
      
      // For now, create some demo data if no posts exist
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles!posts_author_id_fkey(display_name, avatar_url, house:houses(name)),
          post_likes(user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching posts:', error)
        // Create demo data for now
        setPosts(createDemoPosts())
        return
      }

      const formattedPosts = (postsData as any)?.map((post: any) => ({
        id: post.id,
        content: post.content,
        author: {
          id: post.author_id,
          display_name: post.author?.display_name || 'Community Member',
          avatar_url: post.author?.avatar_url,
          house: post.author?.house
        },
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        visibility: post.visibility?.toLowerCase(),
        media_urls: post.media_urls,
        created_at: post.created_at,
        user_liked: post.post_likes?.some((like: any) => like.user_id === user?.id)
      })) || []

      setPosts(formattedPosts.length > 0 ? formattedPosts : createDemoPosts())
    } catch (error) {
      console.error("Error loading posts:", error)
      setPosts(createDemoPosts())
    } finally {
      setLoading(false)
    }
  }

  const createDemoPosts = (): Post[] => [
    {
      id: "demo-1",
      content: "Just had the most incredible night at the ball! The energy was unmatched and the performances were absolutely fierce! 👑✨ #BallroomLife #Fierce",
      author: {
        id: "demo-user-1",
        display_name: "Kai Vogue",
        house: { name: "House of Eleganza" }
      },
      likes_count: 24,
      comments_count: 8,
      visibility: "public",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user_liked: false
    },
    {
      id: "demo-2", 
      content: "Practice session tomorrow at 7pm! Working on our new choreo for the upcoming competition. All house members welcome! 💃🏽",
      author: {
        id: "demo-user-2",
        display_name: "Phoenix Storm",
        house: { name: "House of Avant-Garde" }
      },
      likes_count: 15,
      comments_count: 4,
      visibility: "house_only",
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user_liked: true
    },
    {
      id: "demo-3",
      content: "Reminder: Community guidelines emphasize respect and support for all members. Let's keep lifting each other up! 🌈❤️",
      author: {
        id: "demo-user-3",
        display_name: "Alex Royalty",
        house: { name: "House of Butch Realness" }
      },
      likes_count: 42,
      comments_count: 12,
      visibility: "public",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user_liked: false
    }
  ]

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
