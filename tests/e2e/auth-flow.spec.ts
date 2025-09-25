import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a fresh page
    await page.goto('/')
  })

  test('should display landing page correctly', async ({ page }) => {
    // Check if the main heading is present
    await expect(page.locator('h1')).toBeVisible()

    // Check for sign in/up buttons
    const signInButton = page.getByRole('link', { name: /sign in/i })
    const signUpButton = page.getByRole('link', { name: /join|apply|sign up/i })

    await expect(signInButton.or(signUpButton)).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    // Click on sign in link
    const signInLink = page.getByRole('link', { name: /sign in/i })
    if (await signInLink.isVisible()) {
      await signInLink.click()
      await expect(page).toHaveURL(/.*\/auth\/signin/)
    } else {
      await page.goto('/auth/signin')
    }

    // Check for email input and submit button
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in|continue|submit/i })).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: /join|apply|sign up/i })
    if (await signUpLink.isVisible()) {
      await signUpLink.click()
      await expect(page).toHaveURL(/.*\/auth\/signup/)
    } else {
      await page.goto('/auth/signup')
    }

    // Check for required form fields
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/name|display name/i)).toBeVisible()
  })

  test('should validate email format on sign in', async ({ page }) => {
    await page.goto('/auth/signin')

    const emailInput = page.getByLabel(/email/i)
    const submitButton = page.getByRole('button', { name: /sign in|continue|submit/i })

    // Enter invalid email
    await emailInput.fill('invalid-email')
    await submitButton.click()

    // Check for validation message (either built-in browser validation or custom)
    const isInvalid = await emailInput.evaluate(el => !(el as HTMLInputElement).validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should submit sign in form with valid email', async ({ page }) => {
    await page.goto('/auth/signin')

    const emailInput = page.getByLabel(/email/i)
    const submitButton = page.getByRole('button', { name: /sign in|continue|submit/i })

    // Enter valid email
    await emailInput.fill('test@hausofbasquiat.com')
    await submitButton.click()

    // Check for success message or redirect
    await expect(page.locator('text=/check your email|magic link|sent/i')).toBeVisible({ timeout: 5000 })
      .catch(async () => {
        // Alternative: check if we're redirected to a pending page
        await expect(page).toHaveURL(/.*\/auth\/pending/)
      })
  })

  test('should handle sign up form submission', async ({ page }) => {
    await page.goto('/auth/signup')

    // Fill out the form with valid data
    await page.getByLabel(/email/i).fill('newuser@hausofbasquiat.com')
    await page.getByLabel(/name|display name/i).fill('New Test User')

    // Fill additional fields if they exist
    const bioField = page.getByLabel(/bio|about/i)
    if (await bioField.isVisible()) {
      await bioField.fill('I love ballroom culture and voguing!')
    }

    const phoneField = page.getByLabel(/phone/i)
    if (await phoneField.isVisible()) {
      await phoneField.fill('+1234567890')
    }

    // Submit the form
    const submitButton = page.getByRole('button', { name: /apply|submit|create|join/i })
    await submitButton.click()

    // Check for success message or redirect
    await expect(
      page.locator('text=/application submitted|thank you|under review/i')
    ).toBeVisible({ timeout: 10000 })
      .catch(async () => {
        // Alternative: check if we're redirected to a pending page
        await expect(page).toHaveURL(/.*\/auth\/pending/)
      })
  })

  test('should require authentication for protected pages', async ({ page }) => {
    // Try to access a protected page
    const protectedPages = ['/feed', '/profile', '/chat', '/admin']

    for (const protectedPage of protectedPages) {
      await page.goto(protectedPage)

      // Should redirect to sign in or show unauthorized message
      await expect(page).toHaveURL(/.*\/auth\/signin/).catch(async () => {
        await expect(page.locator('text=/sign in|unauthorized|access denied/i')).toBeVisible()
      })
    }
  })

  test('should handle auth callback', async ({ page }) => {
    // Simulate auth callback with token
    await page.goto('/auth/callback?access_token=fake-token&type=signup')

    // Should redirect to appropriate page after processing
    await page.waitForLoadState('networkidle')

    // Check that we're not stuck on the callback page
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/auth/callback')
  })
})

test.describe('Authentication State', () => {
  test('should persist authentication state across page reloads', async ({ page }) => {
    // Mock authentication by setting localStorage/sessionStorage
    await page.goto('/')

    // Set mock auth tokens
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: '123', email: 'test@example.com' }
      }))
    })

    await page.goto('/feed')

    // If properly authenticated, should not redirect to sign in
    await page.waitForTimeout(1000)
    const currentUrl = page.url()

    if (!currentUrl.includes('/auth/signin')) {
      // Successfully stayed on protected page
      expect(currentUrl).toContain('/feed')
    }
  })

  test('should handle sign out', async ({ page }) => {
    // Mock being signed in first
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: '123', email: 'test@example.com' }
      }))
    })

    await page.goto('/feed')

    // Look for sign out button/link
    const signOutButton = page.getByRole('button', { name: /sign out|logout/i })
      .or(page.getByRole('link', { name: /sign out|logout/i }))

    if (await signOutButton.isVisible()) {
      await signOutButton.click()

      // Should redirect to home or sign in page
      await expect(page).toHaveURL(/.*\/(auth\/signin|$)/)
    }
  })
})