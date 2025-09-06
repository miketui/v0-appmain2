"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Crown, Sparkles } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://your-supabase-url.supabase.co"
const supabaseKey = "your-supabase-key"
const supabase = createClient(supabaseUrl, supabaseKey)

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
      router.push("/feed")
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setError("")

    try {
      // Send magic link via Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setMagicLinkSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send magic link")
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
        <Card className="w-full max-w-md bg-black/80 border-gold-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-gray-300">
              We've sent you a magic link to sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400 text-center">Click the link in your email to continue to the Haus.</p>
            <Button
              variant="outline"
              className="w-full border-gold-500/20 text-gold-400 hover:bg-gold-500/10 bg-transparent"
              onClick={() => setMagicLinkSent(false)}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <Card className="w-full max-w-md bg-black/80 border-gold-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to the Haus
          </CardTitle>
          <CardDescription className="text-gray-300">Sign in to your account to continue your journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-gold-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-500 to-purple-600 hover:from-gold-600 hover:to-purple-700 text-white font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10 bg-transparent"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Magic Link
          </Button>

          <div className="text-center text-sm text-gray-400">
            New to the Haus?{" "}
            <Link href="/auth/signup" className="text-gold-400 hover:text-gold-300 font-medium">
              Apply for membership
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
