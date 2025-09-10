"use client"

// Service Worker registration for PWA functionality
export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope)
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = registration.installing
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🆕 New content is available, please refresh')
                  
                  // You can show a notification to the user here
                  // For example, dispatch a custom event or show a toast
                  window.dispatchEvent(new CustomEvent('sw-update-available'))
                }
              })
            }
          })
          
          // Listen for messages from the service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, payload } = event.data
            
            switch (type) {
              case 'SW_HEARTBEAT':
                // Service worker is alive
                break
                
              case 'MESSAGES_SENT':
                console.log(`📤 ${payload.count} offline messages sent`)
                // You can show a notification or update UI here
                break
                
              default:
                console.log('📨 SW Message:', event.data)
            }
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    })
  } else {
    console.log('⚠️ Service Worker not supported in this browser')
  }
}

// Unregister service worker (for development or maintenance)
export const unregisterServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
        console.log('🗑️ Service Worker unregistered')
      })
      .catch((error) => {
        console.error('❌ Error unregistering Service Worker:', error)
      })
  }
}

// Check if the app is running standalone (installed as PWA)
export const isPWAInstalled = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  )
}

// Prompt user to install PWA
export const promptPWAInstall = () => {
  // This would be called from a button click or user interaction
  // The actual prompt is triggered by the beforeinstallprompt event
  console.log('💾 PWA install prompt triggered')
  
  // Dispatch custom event that components can listen to
  window.dispatchEvent(new CustomEvent('pwa-install-prompt'))
}

// Handle PWA install prompt
export const handlePWAInstall = () => {
  let deferredPrompt: any = null
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('💾 PWA install prompt available')
      // Prevent the mini-infobar from appearing
      e.preventDefault()
      // Save the event so it can be triggered later
      deferredPrompt = e
      
      // Dispatch custom event to show install button
      window.dispatchEvent(new CustomEvent('pwa-installable', { detail: e }))
    })
    
    // Listen for the install event
    window.addEventListener('appinstalled', (e) => {
      console.log('✅ PWA installed successfully')
      deferredPrompt = null
      
      // Hide install button or show success message
      window.dispatchEvent(new CustomEvent('pwa-installed'))
    })
    
    // Function to show the install prompt
    const showInstallPrompt = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted PWA install')
          } else {
            console.log('❌ User dismissed PWA install')
          }
          deferredPrompt = null
        })
      }
    }
    
    // Listen for custom install event
    window.addEventListener('pwa-install-prompt', showInstallPrompt)
  }
}

// Network status monitoring
export const monitorNetworkStatus = () => {
  if (typeof window === 'undefined') return
  
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine
    console.log(`🌐 Network status: ${isOnline ? 'Online' : 'Offline'}`)
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('network-status-change', {
      detail: { isOnline }
    }))
    
    // Update document class for CSS styling
    document.documentElement.classList.toggle('offline', !isOnline)
  }
  
  // Initial status
  updateNetworkStatus()
  
  // Listen for network changes
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
}

// Initialize all PWA functionality
export const initializePWA = () => {
  if (process.env.DISABLE_PWA === 'true') {
    console.log('⚠️ PWA functionality disabled')
    return
  }
  
  registerServiceWorker()
  handlePWAInstall()
  monitorNetworkStatus()
  
  console.log('🚀 PWA functionality initialized')
}