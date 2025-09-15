"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Flag, 
  Ban, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Clock,
  User,
  Shield
} from 'lucide-react'

interface ModerationReport {
  id: string
  type: 'user' | 'content' | 'message' | 'image'
  reportedBy: {
    id: string
    displayName: string
    avatar?: string
  }
  target: {
    id: string
    type: 'user' | 'post' | 'message'
    content?: string
    url?: string
    user?: {
      id: string
      displayName: string
      avatar?: string
    }
  }
  reason: 'harassment' | 'inappropriate_content' | 'spam' | 'fake_profile' | 'copyright' | 'other'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  createdAt: string
  assignedTo?: string
  notes?: string
}

interface ModerationAction {
  type: 'warn' | 'mute' | 'suspend' | 'ban' | 'delete_content' | 'hide_content'
  duration?: number // in hours
  reason: string
  notes?: string
}

export function ModerationTools() {
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null)
  const [actionType, setActionType] = useState<string>('')
  const [actionReason, setActionReason] = useState('')
  const [actionNotes, setActionNotes] = useState('')
  const [actionDuration, setActionDuration] = useState('')

  // Mock data - replace with real API calls
  const reports: ModerationReport[] = [
    {
      id: 'report_1',
      type: 'content',
      reportedBy: {
        id: 'user_1',
        displayName: 'Miss Tina',
        avatar: ''
      },
      target: {
        id: 'post_123',
        type: 'post',
        content: 'This is some inappropriate content that was reported...',
        user: {
          id: 'user_2',
          displayName: 'Problematic User',
          avatar: ''
        }
      },
      reason: 'inappropriate_content',
      description: 'This post contains offensive language and inappropriate imagery.',
      severity: 'high',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'report_2',
      type: 'user',
      reportedBy: {
        id: 'user_3',
        displayName: 'Crystal LaBeija',
        avatar: ''
      },
      target: {
        id: 'user_4',
        type: 'user',
        user: {
          id: 'user_4',
          displayName: 'Harassing User',
          avatar: ''
        }
      },
      reason: 'harassment',
      description: 'This user has been sending threatening messages and making inappropriate comments.',
      severity: 'critical',
      status: 'under_review',
      createdAt: '2024-01-15T09:15:00Z',
      assignedTo: 'admin_1'
    }
  ]

  const handleTakeAction = async (report: ModerationReport, action: ModerationAction) => {
    console.log('Taking moderation action:', { report: report.id, action })
    
    // TODO: Implement actual moderation API calls
    // await moderationAPI.takeAction(report.id, action)
    
    // Show success message
    alert(`Action ${action.type} applied successfully`)
  }

  const handleAssignToSelf = (reportId: string) => {
    console.log('Assigning report to current admin:', reportId)
    // TODO: Implement assignment API
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'harassment': return <MessageSquare className="w-4 h-4" />
      case 'inappropriate_content': return <AlertTriangle className="w-4 h-4" />
      case 'spam': return <Ban className="w-4 h-4" />
      case 'fake_profile': return <User className="w-4 h-4" />
      case 'copyright': return <Shield className="w-4 h-4" />
      default: return <Flag className="w-4 h-4" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.abs(now.getTime() - time.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Reports Queue */}
      <div className="grid gap-4">
        {reports.map(report => (
          <Card key={report.id} className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getReasonIcon(report.reason)}
                    <span className="font-medium">
                      {report.reason.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <Badge className={getSeverityColor(report.severity)}>
                    {report.severity}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(report.createdAt)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Reporter Info */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Reported by:</span>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={report.reportedBy.avatar} />
                    <AvatarFallback className="text-xs">
                      {report.reportedBy.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{report.reportedBy.displayName}</span>
                </div>
              </div>

              {/* Target Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Target:</span>
                  {report.target.user && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={report.target.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {report.target.user.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{report.target.user.displayName}</span>
                    </div>
                  )}
                  <Badge variant="outline">{report.target.type}</Badge>
                </div>
                
                {report.target.content && (
                  <div className="p-3 bg-muted rounded text-sm">
                    <p className="font-medium mb-1">Reported Content:</p>
                    <p className="text-muted-foreground">"{report.target.content}"</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium mb-1">Description:</p>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {report.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignToSelf(report.id)}
                    >
                      Take Case
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Report #{report.id}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Report Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Reason</label>
                            <p className="text-sm text-muted-foreground">
                              {report.reason.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Severity</label>
                            <p className="text-sm text-muted-foreground">{report.severity}</p>
                          </div>
                        </div>

                        {/* Action Selection */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Action</label>
                          <Select value={actionType} onValueChange={setActionType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warn">Send Warning</SelectItem>
                              <SelectItem value="mute">Mute User</SelectItem>
                              <SelectItem value="suspend">Suspend User</SelectItem>
                              <SelectItem value="ban">Ban User</SelectItem>
                              <SelectItem value="delete_content">Delete Content</SelectItem>
                              <SelectItem value="hide_content">Hide Content</SelectItem>
                              <SelectItem value="dismiss">Dismiss Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Duration for temporary actions */}
                        {(actionType === 'mute' || actionType === 'suspend') && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Duration (hours)</label>
                            <Select value={actionDuration} onValueChange={setActionDuration}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 hour</SelectItem>
                                <SelectItem value="24">24 hours</SelectItem>
                                <SelectItem value="168">7 days</SelectItem>
                                <SelectItem value="720">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Reason */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Reason</label>
                          <Textarea
                            placeholder="Provide a reason for this action..."
                            value={actionReason}
                            onChange={(e) => setActionReason(e.target.value)}
                          />
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Internal Notes</label>
                          <Textarea
                            placeholder="Add internal notes for other moderators..."
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button 
                            onClick={() => {
                              if (selectedReport && actionType && actionReason) {
                                handleTakeAction(selectedReport, {
                                  type: actionType as any,
                                  duration: actionDuration ? parseInt(actionDuration) : undefined,
                                  reason: actionReason,
                                  notes: actionNotes
                                })
                              }
                            }}
                            disabled={!actionType || !actionReason}
                          >
                            Apply Action
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}