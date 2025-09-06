"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Mail, Users } from "lucide-react"
import Link from "next/link"

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <Card className="w-full max-w-2xl bg-black/80 border-gold-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent">
            Application Under Review
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your application to join the Haus is being reviewed by our community leaders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Thank you for your interest in joining our ballroom community! Your application is currently being
              reviewed by house leaders.
            </p>

            <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                What happens next?
              </h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gold-400 mt-1">•</span>
                  House leaders will review your application and background
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400 mt-1">•</span>
                  You may be contacted for a brief interview or meet-and-greet
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400 mt-1">•</span>
                  Once approved, you'll receive full access to the community
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-400 mt-1">•</span>
                  The review process typically takes 3-7 business days
                </li>
              </ul>
            </div>

            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">Stay Connected</span>
              </div>
              <p className="text-sm text-gray-300">
                We'll send you an email notification once your application status changes. Make sure to check your spam
                folder just in case!
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
              asChild
            >
              <Link href="/">Return Home</Link>
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
              asChild
            >
              <Link href="/auth/signin">Sign In Again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
