"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Heart, Users } from "lucide-react"

const HOUSES = [
  { id: "house-of-basquiat", name: "House of Basquiat", description: "Artistic expression and creativity" },
  { id: "house-of-eleganza", name: "House of Eleganza", description: "Grace, poise, and sophistication" },
  { id: "house-of-fierce", name: "House of Fierce", description: "Bold confidence and attitude" },
  { id: "house-of-unity", name: "House of Unity", description: "Community and togetherness" },
]

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    pronouns: "",
    houseId: "",
    ballroomName: "",
    experience: "",
    categories: "",
    whyJoin: "",
    socialMedia: {
      instagram: "",
      tiktok: "",
      twitter: "",
    },
  })

  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }))
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || formData.password !== formData.confirmPassword) {
        setError("Please fill in all fields and ensure passwords match")
        return
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
    }
    setError("")
    setStep(step + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signUp(formData.email, formData.password, {
        displayName: formData.displayName,
        display_name: formData.displayName,
        pronouns: formData.pronouns,
        house_id: formData.houseId,
        ballroom_name: formData.ballroomName,
        experience: formData.experience,
        categories: formData.categories,
        why_join: formData.whyJoin,
        social_media: formData.socialMedia,
        role: "APPLICANT",
        status: "pending",
      })

      router.push("/auth/verify-email")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <Card className="w-full max-w-2xl bg-black/80 border-gold-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent">
            Join the Haus
          </CardTitle>
          <CardDescription className="text-gray-300">
            Step {step} of 3: {step === 1 ? "Account Details" : step === 2 ? "Personal Information" : "House Selection"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Create a password"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm your password"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                />
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-200">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    placeholder="How should we call you?"
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronouns" className="text-gray-200">
                    Pronouns
                  </Label>
                  <Input
                    id="pronouns"
                    value={formData.pronouns}
                    onChange={(e) => handleInputChange("pronouns", e.target.value)}
                    placeholder="e.g., they/them, she/her, he/him"
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ballroomName" className="text-gray-200">
                  Ballroom Name (Optional)
                </Label>
                <Input
                  id="ballroomName"
                  value={formData.ballroomName}
                  onChange={(e) => handleInputChange("ballroomName", e.target.value)}
                  placeholder="Your ballroom/voguing name"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-200">
                  Experience Level
                </Label>
                <Select onValueChange={(value) => handleInputChange("experience", value)}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - New to ballroom</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                    <SelectItem value="advanced">Advanced - Experienced performer</SelectItem>
                    <SelectItem value="legend">Legend - Established in the scene</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories" className="text-gray-200">
                  Favorite Categories
                </Label>
                <Input
                  id="categories"
                  value={formData.categories}
                  onChange={(e) => handleInputChange("categories", e.target.value)}
                  placeholder="e.g., Vogue Fem, Runway, Face, etc."
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-200">Choose Your House</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HOUSES.map((house) => (
                    <div
                      key={house.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.houseId === house.id
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-gray-700 bg-gray-900/30 hover:border-gray-600"
                      }`}
                      onClick={() => handleInputChange("houseId", house.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gold-400" />
                        <div>
                          <h3 className="font-medium text-white">{house.name}</h3>
                          <p className="text-sm text-gray-400">{house.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyJoin" className="text-gray-200">
                  Why do you want to join the Haus?
                </Label>
                <Textarea
                  id="whyJoin"
                  value={formData.whyJoin}
                  onChange={(e) => handleInputChange("whyJoin", e.target.value)}
                  placeholder="Tell us about your passion for ballroom culture and what you hope to contribute..."
                  className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">Social Media (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Instagram handle"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                  />
                  <Input
                    placeholder="TikTok handle"
                    value={formData.socialMedia.tiktok}
                    onChange={(e) => handleSocialMediaChange("tiktok", e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                  />
                  <Input
                    placeholder="Twitter handle"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.houseId}
                  className="flex-1 bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-gold-400 hover:text-gold-300 font-medium">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
