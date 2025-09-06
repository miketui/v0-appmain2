"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowRight, CheckCircle, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ApplicationData {
  displayName: string
  pronouns: string
  bio: string
  ballroomExperience: string
  interestedHouse: string
  socialLinks: {
    instagram: string
    twitter: string
    tiktok: string
  }
}

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    displayName: "",
    pronouns: "",
    bio: "",
    ballroomExperience: "",
    interestedHouse: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      tiktok: "",
    },
  })
  const [houses] = useState([
    { id: "1", name: "House of Eleganza" },
    { id: "2", name: "House of Avant-Garde" },
    { id: "3", name: "House of Butch Realness" },
    { id: "4", name: "House of Femme" },
    { id: "5", name: "House of Bizarre" },
  ])
  const router = useRouter()

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading || !validateEmail(email)) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, show application for new emails
      if (email.includes("new")) {
        setShowApplication(true)
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)

    try {
      // Simulate application submission
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEmailSent(true)
    } catch (error) {
      console.error("Application error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationData = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setApplicationData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ApplicationData],
          [child]: value,
        },
      }))
    } else {
      setApplicationData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-blue-50 to-yellow-50">
        <Card className="w-full max-w-md border-2 border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-900" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a magic link to <strong className="text-yellow-600">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Click the link in your email to complete your sign-in or finish your application.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setEmailSent(false)
                setShowApplication(false)
                setEmail("")
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Try different email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showApplication) {
    return (
      <div className="min-h-screen p-4 py-8 bg-gradient-to-br from-red-50 via-blue-50 to-yellow-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent mb-2">
              Join the Haus
            </h1>
            <p className="text-gray-600">Tell us about yourself to complete your application</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-200 text-gray-500 border-2 border-blue-200"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${step < currentStep ? "bg-yellow-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="border-2 border-blue-200">
            <form onSubmit={handleApplicationSubmit}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Community Details"}
                  {currentStep === 3 && "Review & Submit"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
                        <Input
                          required
                          value={applicationData.displayName}
                          onChange={(e) => updateApplicationData("displayName", e.target.value)}
                          placeholder="How should we call you?"
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pronouns</label>
                        <Input
                          value={applicationData.pronouns}
                          onChange={(e) => updateApplicationData("pronouns", e.target.value)}
                          placeholder="she/her, he/him, they/them"
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
                      <Textarea
                        required
                        rows={4}
                        value={applicationData.bio}
                        onChange={(e) => updateApplicationData("bio", e.target.value)}
                        placeholder="Tell us about yourself and what brings you to our community..."
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </>
                )}

                {/* Step 2: Community Details */}
                {currentStep === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ballroom Experience</label>
                      <select
                        value={applicationData.ballroomExperience}
                        onChange={(e) => updateApplicationData("ballroomExperience", e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-md text-gray-900 focus:border-blue-400"
                      >
                        <option value="">Select your experience level</option>
                        <option value="none">New to ballroom culture</option>
                        <option value="beginner">Beginner (0-1 years)</option>
                        <option value="intermediate">Intermediate (1-3 years)</option>
                        <option value="advanced">Advanced (3+ years)</option>
                        <option value="legend">Legendary status</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">House Interest</label>
                      <select
                        value={applicationData.interestedHouse}
                        onChange={(e) => updateApplicationData("interestedHouse", e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-md text-gray-900 focus:border-blue-400"
                      >
                        <option value="">Choose a house that interests you</option>
                        {houses.map((house) => (
                          <option key={house.id} value={house.id}>
                            {house.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Links (Optional)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          type="url"
                          value={applicationData.socialLinks.instagram}
                          onChange={(e) => updateApplicationData("socialLinks.instagram", e.target.value)}
                          placeholder="Instagram URL"
                          className="border-blue-200 focus:border-blue-400"
                        />
                        <Input
                          type="url"
                          value={applicationData.socialLinks.twitter}
                          onChange={(e) => updateApplicationData("socialLinks.twitter", e.target.value)}
                          placeholder="Twitter/X URL"
                          className="border-blue-200 focus:border-blue-400"
                        />
                        <Input
                          type="url"
                          value={applicationData.socialLinks.tiktok}
                          onChange={(e) => updateApplicationData("socialLinks.tiktok", e.target.value)}
                          placeholder="TikTok URL"
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-600">Review Your Application</h3>
                    <div className="grid gap-4">
                      <div>
                        <strong className="text-gray-700">Email:</strong> {email}
                      </div>
                      <div>
                        <strong className="text-gray-700">Name:</strong> {applicationData.displayName}
                      </div>
                      {applicationData.pronouns && (
                        <div>
                          <strong className="text-gray-700">Pronouns:</strong> {applicationData.pronouns}
                        </div>
                      )}
                      <div>
                        <strong className="text-gray-700">Bio:</strong>
                        <p className="text-gray-600 mt-1">{applicationData.bio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Previous
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowApplication(false)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      Back to Login
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 1 && (!applicationData.displayName || !applicationData.bio)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    >
                      {isLoading ? "Submitting..." : "Submit Application"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-blue-50 to-yellow-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
              Haus
            </span>
          </h1>
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-blue-600">of</span>{" "}
            <span className="bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
              Basquiat
            </span>
          </h2>
          <p className="text-gray-600">Enter your email to sign in or apply for membership</p>
        </div>

        {/* Sign In Form */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>Join our vibrant ballroom community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400"
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !validateEmail(email)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isLoading ? "Processing..." : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By continuing, you agree to our community guidelines and commitment to creating a safe, inclusive space for
            all.
          </p>
        </div>
      </div>
    </div>
  )
}
