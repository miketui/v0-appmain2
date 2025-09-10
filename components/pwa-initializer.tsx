"use client"

import { useEffect } from 'react'
import { initializePWA } from '@/lib/sw-register'

export function PWAInitializer() {
  useEffect(() => {
    // Initialize PWA functionality on client-side mount
    initializePWA()
  }, [])

  // This component doesn't render anything visible
  return null
}