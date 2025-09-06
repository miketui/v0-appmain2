import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search") || ""
    const exclude = searchParams.get("exclude")?.split(",") || []

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase
      .from("user_profiles")
      .select("id, display_name, avatar_url, role, house:houses(name)")
      .in("role", ["Member", "Leader", "Admin"])
      .neq("id", user.id)

    if (search) {
      query = query.ilike("display_name", `%${search}%`)
    }

    if (exclude.length > 0) {
      query = query.not("id", "in", `(${exclude.join(",")})`)
    }

    const { data: users, error } = await query.limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
