// Haus of Basquiat Portal - Service Worker
const CACHE_NAME = 'haus-of-basquiat-v1'
const OFFLINE_URL = '/offline'

// Files to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/feed',
  '/chat',
  '/profile',
  '/settings',
  '/offline',
  '/manifest.json'
]

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential files')
        return cache.addAll(CACHE_URLS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip for non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) return

  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone()
          
          // Cache successful API responses
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          
          return response
        })
        .catch(() => {
          // Try to serve from cache if network fails
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response
              }
              
              // Return offline page for navigation requests
              if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL)
              }
              
              // Return a generic offline response for other requests
              return new Response(
                JSON.stringify({ error: 'Offline - no cached data available' }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            })
        })
    )
    return
  }

  // Cache-first strategy for static assets and pages
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Fetch from network and cache the response
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response before caching
            const responseToCache = response.clone()

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // For navigation requests, serve offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
          })
      })
  )
})

// Handle background sync for offline message queue (if supported)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'chat-messages') {
    event.waitUntil(sendPendingMessages())
  }
})

// Send pending chat messages when back online
async function sendPendingMessages() {
  try {
    // Get pending messages from IndexedDB or localStorage
    // This would integrate with your chat system
    console.log('Sending pending messages...')
    
    // Notify the client that messages were sent
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'MESSAGES_SENT',
        payload: { count: 0 }
      })
    })
  } catch (error) {
    console.error('Failed to send pending messages:', error)
  }
}

// Handle push notifications (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || []
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Haus of Basquiat', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

// Send periodic updates to the client
setInterval(() => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_HEARTBEAT',
        timestamp: Date.now()
      })
    })
  })
}, 30000) // Every 30 seconds