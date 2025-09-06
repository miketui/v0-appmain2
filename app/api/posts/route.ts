import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const houseOnly = searchParams.get("houseOnly") === "true"
    const offset = (page - 1) * limit

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
      .from("posts")
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(display_name, avatar_url, house:houses(name)),
        post_likes(user_id),
        comments(count)
      `)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (houseOnly) {
      const { data: userProfile } = await supabase.from("user_profiles").select("house_id").eq("id", user.id).single()

      if (userProfile?.house_id) {
        query = query.eq("house_id", userProfile.house_id)
      }
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Format posts with like status
    const formattedPosts = posts?.map((post) => ({
      ...post,
      likes_count: post.post_likes?.length || 0,
      comments_count: post.comments?.length || 0,
      user_liked: post.post_likes?.some((like) => like.user_id === user.id) || false,
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Posts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { content, visibility = "public", media_urls = [] } = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for house_id
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("house_id, role")
      .eq("id", user.id)
      .single()

    if (!userProfile || !["Member", "Leader", "Admin"].includes(userProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    if (!content && media_urls.length === 0) {
      return NextResponse.json({ error: "Post must have content or media" }, { status: 400 })
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        content,
        media_urls,
        visibility,
        house_id: userProfile.house_id,
        moderation_status: "approved",
      })
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(display_name, avatar_url, house:houses(name))
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      post: { ...post, likes_count: 0, comments_count: 0, user_liked: false },
    })
  } catch (error) {
    console.error("Post creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
