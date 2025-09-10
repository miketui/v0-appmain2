"use client"

import React from 'react'
import { Crown, Wifi, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  const goHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-blue-50 to-yellow-50">
      <Card className="w-full max-w-md border-2 border-blue-200 text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-gray-500" />
          </div>
          <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
            You're Offline
          </CardTitle>
          <CardDescription>
            No internet connection detected. Some features may not be available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Check your internet connection and try again. Your messages and posts will be saved and sent when you're back online.
          </p>
          
          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={goHome}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Go to Home
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>Offline mode is active</p>
            <p>Some content may be cached from your last visit</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}