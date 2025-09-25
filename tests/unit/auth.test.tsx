import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignInPage } from '@/app/auth/signin/page'
import { SignUpPage } from '@/app/auth/signup/page'
import { mockSupabaseClient } from '../__mocks__/supabase'

// Mock the Supabase client
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: () => mockSupabaseClient
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SignInPage', () => {
    it('renders sign in form', () => {
      render(<SignInPage />)

      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('validates email input', async () => {
      render(<SignInPage />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
      })
    })

    it('submits form with valid email', async () => {
      render(<SignInPage />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@hausofbasquiat.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
          email: 'test@hausofbasquiat.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback')
          }
        })
      })
    })
  })

  describe('SignUpPage', () => {
    it('renders sign up form with required fields', () => {
      render(<SignUpPage />)

      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /display name/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      render(<SignUpPage />)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/display name is required/i)).toBeInTheDocument()
      })
    })

    it('submits application with valid data', async () => {
      render(<SignUpPage />)

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const displayNameInput = screen.getByRole('textbox', { name: /display name/i })
      const submitButton = screen.getByRole('button', { name: /create account/i })

      fireEvent.change(emailInput, { target: { value: 'newuser@hausofbasquiat.com' } })
      fireEvent.change(displayNameInput, { target: { value: 'New User' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_applications')
      })
    })
  })
})

// Create minimal page components for testing (these would normally be in your app)
function SignInPageComponent() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    if (!email.includes('@')) {
      throw new Error('Enter a valid email')
    }

    await mockSupabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: '/auth/callback'
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        aria-label="Email"
        required
      />
      <button type="submit">Sign In</button>
    </form>
  )
}

function SignUpPageComponent() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const displayName = formData.get('displayName') as string

    if (!email) throw new Error('Email is required')
    if (!displayName) throw new Error('Display name is required')

    await mockSupabaseClient.from('user_applications').insert({
      email,
      display_name: displayName
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        aria-label="Email"
        required
      />
      <input
        type="text"
        name="displayName"
        aria-label="Display Name"
        required
      />
      <button type="submit">Create Account</button>
    </form>
  )
}

// Mock the page exports
export const SignInPage = SignInPageComponent
export const SignUpPage = SignUpPageComponent