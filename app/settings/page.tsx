"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, User, Shield, Bell, Palette, LogOut, AlertTriangle } from "lucide-react"

interface UserSettings {
  id: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  privacy_level: "public" | "private" | "friends"
  theme_preference: "light" | "dark" | "auto"
  language: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSettings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        setUser(user)
        setNewEmail(user.email || "")

        const { data: settingsData } = await supabase.from("user_settings").select("*").eq("id", user.id).single()

        if (settingsData) {
          setSettings(settingsData)
        } else {
          const defaultSettings: UserSettings = {
            id: user.id,
            email_notifications: true,
            push_notifications: true,
            marketing_emails: false,
            privacy_level: "public",
            theme_preference: "auto",
            language: "en",
          }
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSettings()
  }, [supabase])

  const handleSaveSettings = async () => {
    if (!user || !settings) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("user_settings").upsert(settings)

      if (error) throw error
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) return

    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) throw error
    } catch (error) {
      console.error("Error updating email:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    setIsChangingPassword(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error("Error sending password reset:", error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-amber-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-amber-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Settings Not Found</h1>
          <p className="text-gray-400">Unable to load your settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-amber-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <User className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500 flex-1"
                  />
                  <Button
                    onClick={handleUpdateEmail}
                    disabled={isSaving || newEmail === user?.email}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <Button
                  onClick={handlePasswordReset}
                  disabled={isChangingPassword}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  {isChangingPassword ? "Sending..." : "Send Password Reset Email"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Profile Visibility</label>
                <Select
                  value={settings.privacy_level}
                  onValueChange={(value) =>
                    setSettings((prev) =>
                      prev ? { ...prev, privacy_level: value as UserSettings["privacy_level"] } : null,
                    )
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="public">Public - Visible to everyone</SelectItem>
                    <SelectItem value="friends">Friends - Visible to connections only</SelectItem>
                    <SelectItem value="private">Private - Only visible to you</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "email_notifications",
                  label: "Email Notifications",
                  description: "Receive notifications via email",
                },
                {
                  key: "push_notifications",
                  label: "Push Notifications",
                  description: "Receive browser push notifications",
                },
                {
                  key: "marketing_emails",
                  label: "Marketing Emails",
                  description: "Receive updates about new features and events",
                },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{label}</div>
                    <div className="text-sm text-gray-400">{description}</div>
                  </div>
                  <Switch
                    checked={settings[key as keyof UserSettings] as boolean}
                    onCheckedChange={(checked) => setSettings((prev) => (prev ? { ...prev, [key]: checked } : null))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Theme Preference</label>
                <Select
                  value={settings.theme_preference}
                  onValueChange={(value) =>
                    setSettings((prev) =>
                      prev ? { ...prev, theme_preference: value as UserSettings["theme_preference"] } : null,
                    )
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Language</label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings((prev) => (prev ? { ...prev, language: value } : null))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Sign Out</h3>
                  <p className="text-sm text-gray-400">Sign out of your account on this device</p>
                </div>
                <Button onClick={handleSignOut} variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
