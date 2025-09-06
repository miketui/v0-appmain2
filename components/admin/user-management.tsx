"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MoreVertical, UserCheck, UserX, Shield, Crown } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface User {
  id: string
  display_name: string
  email: string
  role: "applicant" | "member" | "leader" | "admin"
  status: "pending" | "active" | "banned"
  avatar_url?: string
  house?: { name: string }
  created_at: string
  last_active_at?: string
  post_count: number
  follower_count: number
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      // Mock user data for demonstration
      const mockUsers: User[] = [
        {
          id: "1",
          display_name: "Maya Chen",
          email: "maya.chen@email.com",
          role: "leader",
          status: "active",
          avatar_url: "/placeholder.svg",
          house: { name: "House of Eleganza" },
          created_at: new Date(Date.now() - 2592000000).toISOString(),
          last_active_at: new Date(Date.now() - 3600000).toISOString(),
          post_count: 45,
          follower_count: 234,
        },
        {
          id: "2",
          display_name: "Alex Rodriguez",
          email: "alex.rodriguez@email.com",
          role: "member",
          status: "active",
          house: { name: "House of Avant-Garde" },
          created_at: new Date(Date.now() - 1209600000).toISOString(),
          last_active_at: new Date(Date.now() - 7200000).toISOString(),
          post_count: 23,
          follower_count: 89,
        },
        {
          id: "3",
          display_name: "Jordan Smith",
          email: "jordan.smith@email.com",
          role: "applicant",
          status: "pending",
          created_at: new Date(Date.now() - 604800000).toISOString(),
          post_count: 0,
          follower_count: 0,
        },
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.display_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.house?.name.toLowerCase().includes(query),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const getRoleBadge = (role: string) => {
    const configs = {
      admin: { color: "bg-red-500/20 text-red-400", icon: Crown },
      leader: { color: "bg-purple-500/20 text-purple-400", icon: Shield },
      member: { color: "bg-blue-500/20 text-blue-400", icon: UserCheck },
      applicant: { color: "bg-gray-500/20 text-gray-400", icon: UserX },
    }
    return configs[role as keyof typeof configs] || configs.applicant
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { color: "bg-green-500/20 text-green-400", label: "Active" },
      pending: { color: "bg-yellow-500/20 text-yellow-400", label: "Pending" },
      banned: { color: "bg-red-500/20 text-red-400", label: "Banned" },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole as any } : user)))
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: newStatus as any } : user)))
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gold-400">User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or house..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="applicant">Applicant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const roleBadge = getRoleBadge(user.role)
          const statusBadge = getStatusBadge(user.status)

          return (
            <Card key={user.id} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-gold-500/20">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-gold-400 to-purple-600 text-white">
                        {user.display_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-medium text-white">{user.display_name}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      {user.house && <p className="text-xs text-gray-500">{user.house.name}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-300">{user.post_count} posts</p>
                      <p className="text-gray-400">{user.follower_count} followers</p>
                      <p className="text-gray-500">
                        {user.last_active_at ? `Active ${formatTime(user.last_active_at)}` : "Never active"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Badge className={`${roleBadge.color} px-3 py-1`}>
                        <roleBadge.icon className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge className={`${statusBadge.color} px-3 py-1`}>{statusBadge.label}</Badge>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                        <SelectTrigger className="w-24 h-8 bg-gray-800/50 border-gray-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applicant">Applicant</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="leader">Leader</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={user.status} onValueChange={(value) => handleStatusChange(user.id, value)}>
                        <SelectTrigger className="w-24 h-8 bg-gray-800/50 border-gray-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No users found</h3>
            <p className="text-gray-400">Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
