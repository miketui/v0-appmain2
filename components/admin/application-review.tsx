"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FileCheck, Clock, CheckCircle, XCircle, User } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface Application {
  id: string
  user: {
    display_name: string
    email: string
    avatar_url?: string
  }
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  application_data: {
    pronouns: string
    ballroom_name?: string
    experience: string
    categories: string
    why_join: string
    house_preference: string
    social_media?: {
      instagram?: string
      tiktok?: string
      twitter?: string
    }
  }
  review_notes?: string
  reviewed_at?: string
  reviewed_by?: string
}

export function ApplicationReview() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      // Mock application data
      const mockApplications: Application[] = [
        {
          id: "1",
          user: {
            display_name: "Jordan Smith",
            email: "jordan.smith@email.com",
          },
          status: "pending",
          submitted_at: new Date(Date.now() - 86400000).toISOString(),
          application_data: {
            pronouns: "they/them",
            ballroom_name: "Jordan Fierce",
            experience: "intermediate",
            categories: "Vogue Fem, Runway, Face",
            why_join:
              "I've been voguing for 3 years and want to connect with the community and learn from experienced performers. I'm passionate about the art form and its history.",
            house_preference: "House of Eleganza",
            social_media: {
              instagram: "@jordanfierce",
              tiktok: "@jordanvogue",
            },
          },
        },
        {
          id: "2",
          user: {
            display_name: "Sam Rivera",
            email: "sam.rivera@email.com",
          },
          status: "pending",
          submitted_at: new Date(Date.now() - 172800000).toISOString(),
          application_data: {
            pronouns: "he/him",
            experience: "beginner",
            categories: "Butch Realness, Old Way",
            why_join:
              "New to ballroom but very eager to learn and contribute to the community. I've been watching balls online and want to start participating.",
            house_preference: "House of Butch Realness",
          },
        },
      ]
      setApplications(mockApplications)
    } catch (error) {
      console.error("Error loading applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (applicationId: string, decision: "approved" | "rejected") => {
    try {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: decision,
                review_notes: reviewNotes,
                reviewed_at: new Date().toISOString(),
                reviewed_by: "Current Admin",
              }
            : app,
        ),
      )
      setSelectedApplication(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Error reviewing application:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pending" },
      approved: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Approved" },
      rejected: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Rejected" },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const reviewedApplications = applications.filter((app) => app.status !== "pending")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{pendingApplications.length}</div>
            <div className="text-sm text-yellow-300">Pending Review</div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">
              {applications.filter((app) => app.status === "approved").length}
            </div>
            <div className="text-sm text-green-300">Approved</div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-400">
              {applications.filter((app) => app.status === "rejected").length}
            </div>
            <div className="text-sm text-red-300">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gold-400 flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Pending Applications ({pendingApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No pending applications</h3>
              <p className="text-gray-400">All applications have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((application) => {
                const statusBadge = getStatusBadge(application.status)

                return (
                  <Card key={application.id} className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{application.user.display_name}</h3>
                            <p className="text-sm text-gray-400">{application.user.email}</p>
                            <p className="text-xs text-gray-500">Applied {formatTime(application.submitted_at)}</p>
                          </div>
                        </div>

                        <Badge className={`${statusBadge.color} px-3 py-1`}>
                          <statusBadge.icon className="w-3 h-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Basic Info</h4>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p>Pronouns: {application.application_data.pronouns}</p>
                            {application.application_data.ballroom_name && (
                              <p>Ballroom Name: {application.application_data.ballroom_name}</p>
                            )}
                            <p>Experience: {application.application_data.experience}</p>
                            <p>House Preference: {application.application_data.house_preference}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Categories</h4>
                          <p className="text-sm text-gray-400">{application.application_data.categories}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Why Join?</h4>
                        <p className="text-sm text-gray-400">{application.application_data.why_join}</p>
                      </div>

                      {application.application_data.social_media && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Social Media</h4>
                          <div className="flex gap-4 text-sm text-gray-400">
                            {application.application_data.social_media.instagram && (
                              <span>IG: {application.application_data.social_media.instagram}</span>
                            )}
                            {application.application_data.social_media.tiktok && (
                              <span>TikTok: {application.application_data.social_media.tiktok}</span>
                            )}
                            {application.application_data.social_media.twitter && (
                              <span>Twitter: {application.application_data.social_media.twitter}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedApplication(application)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Review Application
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-gold-400">Review Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">{selectedApplication.user.display_name}</h3>
                <p className="text-sm text-gray-400">{selectedApplication.user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="bg-gray-800/50 border-gray-600 text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedApplication(null)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReview(selectedApplication.id, "rejected")}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview(selectedApplication.id, "approved")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
