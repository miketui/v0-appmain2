"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AdminStats } from "@/components/admin/admin-stats"
import { UserManagement } from "@/components/admin/user-management"
import { ApplicationReview } from "@/components/admin/application-review"
import { ContentModeration } from "@/components/admin/content-moderation"
import { SystemSettings } from "@/components/admin/system-settings"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, FileCheck, Flag, Settings, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "ADMIN") {
        window.location.href = "/feed"
        return
      }
      loadDashboardData()
    }
  }, [authLoading, user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load admin statistics
      const response = await apiClient.getUsers("", []) // Just to test API
      // Mock stats for now
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        newUsersThisWeek: 34,
        pendingApplications: 12,
        totalPosts: 5632,
        flaggedContent: 8,
        totalLibraryItems: 2341,
        totalMessages: 8901,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900">
        <div className="flex items-center gap-3 text-gold-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900">
        <Card className="w-full max-w-md bg-black/80 border-red-500/20">
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
            <p className="text-gray-300">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage the Haus of Basquiat community</p>
        </div>

        {/* Stats Overview */}
        {stats && <AdminStats stats={stats} />}

        {/* Admin Tabs */}
        <Card className="bg-black/80 border-gold-500/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-gray-900/50">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Applications
                </TabsTrigger>
                <TabsTrigger value="moderation" className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Moderation
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <UserManagement />
              </TabsContent>

              <TabsContent value="applications">
                <ApplicationReview />
              </TabsContent>

              <TabsContent value="moderation">
                <ContentModeration />
              </TabsContent>

              <TabsContent value="settings">
                <SystemSettings />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gold-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gold-400 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-300">Advanced analytics and reporting features are in development.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
