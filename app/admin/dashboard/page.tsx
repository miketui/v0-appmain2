"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Crown, 
  MessageSquare, 
  Flag, 
  TrendingUp, 
  Eye, 
  Ban, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Activity
} from 'lucide-react'

interface User {
  id: string
  displayName: string
  email: string
  avatar?: string
  role: 'ADMIN' | 'LEADER' | 'MEMBER' | 'APPLICANT'
  houseName?: string
  status: 'active' | 'suspended' | 'pending'
  createdAt: string
  lastActive: string
  reportCount: number
}

interface Report {
  id: string
  type: 'user' | 'content' | 'message'
  reportedBy: string
  targetId: string
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  assignedTo?: string
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  pendingApplications: number
  totalReports: number
  resolvedReports: number
  messagesSent: number
  postsCreated: number
  eventsScheduled: number
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - replace with real API calls
  const stats: DashboardStats = {
    totalUsers: 1247,
    activeUsers: 892,
    pendingApplications: 23,
    totalReports: 45,
    resolvedReports: 38,
    messagesSent: 12450,
    postsCreated: 567,
    eventsScheduled: 12
  }

  const recentUsers: User[] = [
    {
      id: 'user_1',
      displayName: 'Miss Tina',
      email: 'tina@hausofbasquiat.com',
      role: 'MEMBER',
      houseName: 'House of Revlon',
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      lastActive: '2024-01-15T14:30:00Z',
      reportCount: 0
    },
    {
      id: 'user_2',
      displayName: 'Pepper LaBeija',
      email: 'pepper@hausofbasquiat.com',
      role: 'LEADER',
      houseName: 'House of LaBeija',
      status: 'active',
      createdAt: '2024-01-14T15:20:00Z',
      lastActive: '2024-01-15T12:00:00Z',
      reportCount: 1
    },
    {
      id: 'user_3',
      displayName: 'New Applicant',
      email: 'newbie@example.com',
      role: 'APPLICANT',
      status: 'pending',
      createdAt: '2024-01-15T09:00:00Z',
      lastActive: '2024-01-15T09:00:00Z',
      reportCount: 0
    }
  ]

  const pendingReports: Report[] = [
    {
      id: 'report_1',
      type: 'user',
      reportedBy: 'user_5',
      targetId: 'user_6',
      reason: 'harassment',
      description: 'Inappropriate comments in house chat',
      status: 'pending',
      createdAt: '2024-01-15T11:00:00Z'
    },
    {
      id: 'report_2',
      type: 'content',
      reportedBy: 'user_7',
      targetId: 'post_123',
      reason: 'inappropriate_content',
      description: 'Offensive imagery in gallery post',
      status: 'pending',
      createdAt: '2024-01-15T10:15:00Z'
    }
  ]

  const handleUserAction = (userId: string, action: 'approve' | 'suspend' | 'ban' | 'promote') => {
    console.log(`Performing ${action} on user ${userId}`)
    // TODO: Implement user action API calls
  }

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss' | 'escalate') => {
    console.log(`Performing ${action} on report ${reportId}`)
    // TODO: Implement report action API calls
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'LEADER': return 'bg-purple-100 text-purple-800'
      case 'MEMBER': return 'bg-blue-100 text-blue-800'
      case 'APPLICANT': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the Haus of Basquiat community</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Admin Access
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports - stats.resolvedReports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resolvedReports} resolved this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Messages this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.slice(0, 3).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.houseName}</p>
                        </div>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReports.slice(0, 3).map(report => (
                    <div key={report.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{report.reason.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.type} report • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="LEADER">Leader</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="APPLICANT">Applicant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.houseName || 'None'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.reportCount > 0 ? (
                          <Badge variant="destructive">{user.reportCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'approve')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {user.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{report.reason.replace('_', ' ')}</TableCell>
                      <TableCell>{report.reportedBy}</TableCell>
                      <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'resolve')}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content management tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}