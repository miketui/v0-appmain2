import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic behavior for API routes that need search params
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

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
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&').substring(0, 100)
      query = query.ilike("display_name", `%${sanitizedSearch}%`)
    }

    if (exclude.length > 0) {
      const sanitizedExclude = exclude.map(id => parseInt(id)).filter(id => !isNaN(id))
      if (sanitizedExclude.length > 0) {
        query = query.not("id", "in", `(${sanitizedExclude.join(",")})`)
      }
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
