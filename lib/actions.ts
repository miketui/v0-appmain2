"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/feed")
}

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const displayName = formData.get("displayName") as string
  const houseId = formData.get("houseId") as string

  if (!email || !password || !displayName) {
    return { error: "All fields are required" }
  }

  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        display_name: displayName,
        house_id: houseId || null,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: "Check your email to confirm your account" }
}

export async function signOutAction() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function updateProfileAction(formData: FormData) {
  const displayName = formData.get("displayName") as string
  const bio = formData.get("bio") as string
  const houseName = formData.get("houseName") as string

  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: displayName,
      bio,
      house_name: houseName,
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function createPostAction(formData: FormData) {
  const content = formData.get("content") as string
  const visibility = formData.get("visibility") as string

  if (!content) {
    return { error: "Content is required" }
  }

  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user profile for house_id
  const { data: userProfile } = await supabase.from("user_profiles").select("house_id, role").eq("id", user.id).single()

  if (!userProfile || !["Member", "Leader", "Admin"].includes(userProfile.role)) {
    return { error: "Insufficient permissions" }
  }

  const { error } = await supabase.from("posts").insert({
    author_id: user.id,
    content,
    visibility: visibility || "public",
    house_id: userProfile.house_id,
    moderation_status: "approved",
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/feed")
  return { success: true }
}
