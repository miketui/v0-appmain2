import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { postId } = params

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like
      const { error } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Like toggle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
