"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserPlus, FileText, MessageCircle, Flag, TrendingUp, Activity } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    activeUsers: number
    newUsersThisWeek: number
    pendingApplications: number
    totalPosts: number
    flaggedContent: number
    totalLibraryItems: number
    totalMessages: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      subtitle: `+${stats.newUsersThisWeek} this week`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      subtitle: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`,
      icon: UserCheck,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications.toString(),
      subtitle: "Awaiting review",
      icon: UserPlus,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts.toLocaleString(),
      subtitle: `Avg ${Math.round(stats.totalPosts / stats.totalUsers)} per user`,
      icon: FileText,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Messages Sent",
      value: stats.totalMessages.toLocaleString(),
      subtitle: "Community conversations",
      icon: MessageCircle,
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Flagged Content",
      value: stats.flaggedContent.toString(),
      subtitle: "Needs moderation",
      icon: Flag,
      color: "from-red-500 to-rose-500",
    },
    {
      title: "Library Items",
      value: stats.totalLibraryItems.toLocaleString(),
      subtitle: "Shared resources",
      icon: TrendingUp,
      color: "from-teal-500 to-cyan-500",
    },
    {
      title: "System Health",
      value: "100%",
      subtitle: "All systems operational",
      icon: Activity,
      color: "from-green-500 to-teal-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-black/60 border-gold-500/20 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <p className="text-xs text-gray-400">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
