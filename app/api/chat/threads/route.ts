import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: threads, error } = await supabase
      .from("chat_threads")
      .select(`
        *,
        messages(content, created_at, sender_id, message_type)
      `)
      .contains("participants", [user.id])
      .order("last_message_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Get participant details for each thread
    const threadsWithParticipants = await Promise.all(
      threads?.map(async (thread) => {
        const { data: participants } = await supabase
          .from("user_profiles")
          .select("id, display_name, avatar_url")
          .in("id", thread.participants)

        const otherParticipants = participants?.filter((p) => p.id !== user.id) || []
        const lastMessage = thread.messages?.[0]

        return {
          ...thread,
          other_participants: otherParticipants,
          last_message: lastMessage,
          unread_count: 0, // TODO: Implement unread count
        }
      }) || [],
    )

    return NextResponse.json({ threads: threadsWithParticipants })
  } catch (error) {
    console.error("Threads fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { participantIds, name, threadType = "direct" } = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!participantIds || participantIds.length === 0) {
      return NextResponse.json({ error: "Participant IDs are required" }, { status: 400 })
    }

    // Include current user in participants
    const allParticipants = [...new Set([user.id, ...participantIds])]

    // For direct messages, check if thread already exists
    if (threadType === "direct" && allParticipants.length === 2) {
      const { data: existingThread } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("thread_type", "direct")
        .contains("participants", allParticipants)
        .single()

      if (existingThread && existingThread.participants.length === 2) {
        return NextResponse.json({ thread: existingThread })
      }
    }

    const { data: thread, error } = await supabase
      .from("chat_threads")
      .insert({
        name,
        thread_type: threadType,
        participants: allParticipants,
        created_by: user.id,
      })
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error("Thread creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
