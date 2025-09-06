"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Eye, Trash2, CheckCircle, AlertTriangle } from "lucide-react"

export function ContentModeration() {
  const [flaggedContent] = useState([
    {
      id: "1",
      type: "post",
      content: "This is a sample flagged post content that may contain inappropriate material...",
      author: "User123",
      flagged_by: "User456",
      reason: "Inappropriate content",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: "pending",
    },
    {
      id: "2",
      type: "comment",
      content: "This is a flagged comment that was reported by the community...",
      author: "User789",
      flagged_by: "User101",
      reason: "Harassment",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      status: "pending",
    },
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 text-center">
            <Flag className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-400">{flaggedContent.length}</div>
            <div className="text-sm text-red-300">Flagged Content</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">0</div>
            <div className="text-sm text-yellow-300">Under Review</div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">0</div>
            <div className="text-sm text-green-300">Resolved Today</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gold-400 flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Content Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedContent.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-400 mb-2">All Clear!</h3>
              <p className="text-gray-300">No content currently flagged for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <Card key={item.id} className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-500/20 text-red-400">{item.type}</Badge>
                          <Badge className="bg-yellow-500/20 text-yellow-400">{item.reason}</Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          By {item.author} • Flagged by {item.flagged_by}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 p-3 rounded mb-4">
                      <p className="text-gray-300 text-sm">{item.content}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Context
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
