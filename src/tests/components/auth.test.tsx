import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

// Mock auth service
const mockAuthService = {
  getCurrentUser: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  })),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}

vi.mock('@/lib/auth', () => ({
  authService: mockAuthService,
}))

// Test component that uses the auth hook
function TestAuthComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {user ? (
        <div>
          <span data-testid="user-name">{user.profile?.displayName}</span>
          <button onClick={() => signOut()} data-testid="signout-btn">
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => signIn('test@example.com', 'password')}
            data-testid="signin-btn"
          >
            Sign In
          </button>
          <button
            onClick={() => signUp('test@example.com', 'password', { displayName: 'Test User' })}
            data-testid="signup-btn"
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  )
}

describe('Auth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthService.getCurrentUser.mockResolvedValue(null)
  })

  it('should render loading state initially', () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render sign in/up buttons when not authenticated', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null)

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('signin-btn')).toBeInTheDocument()
      expect(screen.getByTestId('signup-btn')).toBeInTheDocument()
    })
  })

  it('should render user info when authenticated', async () => {
    const mockUser = {
      id: 'user_1',
      email: 'test@example.com',
      profile: {
        id: 'profile_1',
        userId: 'user_1',
        displayName: 'Test User',
        role: 'MEMBER' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      }
    }

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(screen.getByTestId('signout-btn')).toBeInTheDocument()
    })
  })

  it('should call signIn when sign in button is clicked', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('signin-btn')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('signin-btn'))

    expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('should call signUp when sign up button is clicked', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('signup-btn')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('signup-btn'))

    expect(mockAuthService.signUp).toHaveBeenCalledWith(
      'test@example.com', 
      'password', 
      { displayName: 'Test User' }
    )
  })

  it('should call signOut when sign out button is clicked', async () => {
    const mockUser = {
      id: 'user_1',
      email: 'test@example.com',
      profile: {
        id: 'profile_1',
        userId: 'user_1',
        displayName: 'Test User',
        role: 'MEMBER' as const,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      }
    }

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser)
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('signout-btn')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('signout-btn'))

    expect(mockAuthService.signOut).toHaveBeenCalled()
  })

  it('should handle sign in errors gracefully', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null)
    mockAuthService.signIn.mockRejectedValue(new Error('Invalid credentials'))
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('signin-btn')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('signin-btn'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Sign in failed:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})