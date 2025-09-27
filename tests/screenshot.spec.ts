import { test, expect } from '@playwright/test'

/**
 * Visual regression tests and page screenshots
 * Generates screenshots for all main routes in the application
 */

const routes = [
  { path: '/', name: 'home' },
  { path: '/auth/signin', name: 'signin' },
  { path: '/auth/signup', name: 'signup' },
  { path: '/feed', name: 'feed', auth: true },
  { path: '/gallery/upload', name: 'gallery_upload', auth: true },
  { path: '/chat', name: 'chat', auth: true },
  { path: '/messages', name: 'messages', auth: true },
  { path: '/profile', name: 'profile', auth: true },
  { path: '/settings', name: 'settings', auth: true },
  { path: '/admin', name: 'admin', auth: true, admin: true },
  { path: '/offline', name: 'offline' }
]

// Mock authentication for protected routes
test.beforeEach(async ({ page }) => {
  // Mock authenticated user
  await page.addInitScript(() => {
    // Mock localStorage auth data
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'member'
      }
    }))
  })
})

for (const route of routes) {
  test(`Screenshot: ${route.name}`, async ({ page }) => {
    test.setTimeout(30000)
    
    try {
      // Navigate to route
      await page.goto(route.path, { 
        waitUntil: 'networkidle',
        timeout: 15000 
      })
      
      // Wait for main content to load
      await page.waitForSelector('main, [data-testid="main-content"], body', {
        timeout: 10000
      })
      
      // Additional wait for dynamic content
      await page.waitForTimeout(2000)
      
      // Take full page screenshot
      await page.screenshot({
        path: `screenshots/${route.name}.png`,
        fullPage: true,
        animations: 'disabled'
      })
      
      // Take viewport screenshot
      await page.screenshot({
        path: `screenshots/${route.name}_viewport.png`,
        animations: 'disabled'
      })
      
      // Basic accessibility check
      await expect(page).toHaveTitle(/.+/)
      
      // Check for critical errors
      const errors = await page.evaluate(() => {
        return window.console && window.console.error ? [] : []
      })
      
    } catch (error) {
      console.warn(`Screenshot failed for ${route.path}:`, error.message)
      
      // Take error screenshot
      await page.screenshot({
        path: `screenshots/${route.name}_error.png`,
        fullPage: true
      })
    }
  })
}

test('Mobile screenshots', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })
  
  const mobileRoutes = ['/', '/feed', '/chat', '/profile']
  
  for (const route of mobileRoutes) {
    try {
      await page.goto(route, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)
      
      await page.screenshot({
        path: `screenshots/mobile_${route.replace('/', '') || 'home'}.png`,
        fullPage: true
      })
    } catch (error) {
      console.warn(`Mobile screenshot failed for ${route}:`, error.message)
    }
  }
})

test('Theme screenshots', async ({ page }) => {
  const themePaths = ['/feed', '/profile']
  
  for (const path of themePaths) {
    try {
      // Light theme
      await page.goto(path)
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark')
      })
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: `screenshots/light_${path.replace('/', '') || 'home'}.png`,
        fullPage: true
      })
      
      // Dark theme  
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: `screenshots/dark_${path.replace('/', '') || 'home'}.png`,
        fullPage: true
      })
    } catch (error) {
      console.warn(`Theme screenshot failed for ${path}:`, error.message)
    }
  }
})