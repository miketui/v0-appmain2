"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data.session) {
          // Get user profile to determine redirect
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", data.session.user.id)
            .single()

          setStatus("success")
          setMessage("Successfully signed in! Redirecting...")

          // Redirect based on user status and role
          setTimeout(() => {
            if (profile?.status === "pending") {
              router.push("/auth/pending")
            } else if (profile?.role === "admin") {
              router.push("/admin")
            } else {
              router.push("/feed")
            }
          }, 2000)
        } else {
          throw new Error("No session found")
        }
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "Authentication failed")

        // Redirect to signin after error
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gold-900 p-4">
      <Card className="w-full max-w-md bg-black/80 border-gold-500/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-gold-400 to-purple-600 rounded-full flex items-center justify-center">
            {status === "loading" && <Loader2 className="w-8 h-8 text-white animate-spin" />}
            {status === "success" && <CheckCircle className="w-8 h-8 text-green-400" />}
            {status === "error" && <XCircle className="w-8 h-8 text-red-400" />}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Welcome Back!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-300">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}
