"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Save, X, Crown, Star, Users } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  display_name: string
  bio: string
  house_name: string
  role: string
  created_at: string
  avatar_url?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
    house_name: "",
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
        setEditForm({
          display_name: profileData.display_name || "",
          bio: profileData.bio || "",
          house_name: profileData.house_name || "",
        })
      }
    }

    getProfile()
  }, [supabase])

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("users").update(editForm).eq("id", profile.id)

      if (!error) {
        setProfile({ ...profile, ...editForm })
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Crown className="w-4 h-4" />
      case "Leader":
        return <Star className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "Leader":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-green-500/20 text-green-300 border-green-500/30"
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-amber-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-6"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-amber-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
            Your Profile
          </h1>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex-shrink-0 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-gradient-to-r from-purple-500 to-amber-500">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-amber-500 text-white text-3xl font-bold">
                    {profile.display_name?.charAt(0) || profile.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex justify-center mb-4">
                  <Badge className={`${getRoleColor(profile.role)} flex items-center gap-1 px-3 py-1`}>
                    {getRoleIcon(profile.role)}
                    {profile.role}
                  </Badge>
                </div>

                <div className="text-sm text-gray-400">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Profile Information */}
              <div className="flex-1 space-y-6">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                      <Input
                        value={editForm.display_name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, display_name: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Your display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">House Affiliation</label>
                      <Input
                        value={editForm.house_name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, house_name: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Your house name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 min-h-[120px]"
                        placeholder="Tell the community about yourself, your journey in ballroom culture, achievements, and what drives your passion..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {profile.display_name || "No display name set"}
                      </h2>
                      <p className="text-gray-400">{profile.email}</p>
                    </div>

                    {profile.house_name && (
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-2">House Affiliation</h3>
                        <p className="text-white text-xl font-medium">{profile.house_name}</p>
                      </div>
                    )}

                    {profile.bio ? (
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-2">About</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Your story awaits to be told...</p>
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                        >
                          Add Your Bio
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-400">Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts Created</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Comments Made</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Likes Received</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-400">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-500">No achievements yet</p>
                <p className="text-sm text-gray-600 mt-2">Participate in the community to earn achievements!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
