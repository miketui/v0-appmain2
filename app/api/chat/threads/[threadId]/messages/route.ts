import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { threadId } = params
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is participant in thread
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select("participants")
      .eq("id", threadId)
      .single()

    if (threadError || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    if (!thread.participants.includes(user.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:user_profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ messages: messages?.reverse() || [] })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { threadId } = params
    const { content, messageType = "text", replyTo } = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is participant in thread
    const { data: thread, error: threadError } = await supabase
      .from("chat_threads")
      .select("participants")
      .eq("id", threadId)
      .single()

    if (threadError || !thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    if (!thread.participants.includes(user.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Insert message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content: content || null,
        message_type: messageType,
        reply_to: replyTo || null,
      })
      .select(`
        *,
        sender:user_profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update thread's last message timestamp
    await supabase.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
