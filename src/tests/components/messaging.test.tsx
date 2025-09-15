import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageThread } from '@/components/messaging/message-thread'

// Mock hooks
const mockUseAuth = {
  user: {
    id: 'user_1',
    email: 'test@example.com',
    profile: {
      displayName: 'Test User',
      role: 'MEMBER',
    }
  }
}

const mockUseSocket = {
  messages: [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'user_2',
      content: 'Hello there!',
      type: 'text' as const,
      createdAt: '2024-01-15T10:30:00Z',
      sender: {
        id: 'user_2',
        displayName: 'Other User',
        avatar: '',
      }
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'user_1',
      content: 'Hi back!',
      type: 'text' as const,
      createdAt: '2024-01-15T10:31:00Z',
      sender: {
        id: 'user_1',
        displayName: 'Test User',
        avatar: '',
      }
    }
  ],
  typingUsers: [],
  isConnected: true,
  sendMessage: vi.fn(),
  joinConversation: vi.fn(),
  leaveConversation: vi.fn(),
  startTyping: vi.fn(),
  stopTyping: vi.fn(),
  markAsRead: vi.fn(),
}

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}))

vi.mock('@/hooks/use-socket', () => ({
  useSocket: () => mockUseSocket,
}))

describe('MessageThread Component', () => {
  const mockProps = {
    conversationId: 'conv_1',
    title: 'Test Conversation',
    participants: [
      {
        id: 'user_1',
        displayName: 'Test User',
        status: 'online' as const,
      },
      {
        id: 'user_2',
        displayName: 'Other User',
        status: 'online' as const,
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render conversation title and participants', () => {
    render(<MessageThread {...mockProps} />)

    expect(screen.getByText('Test Conversation')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('Other User')).toBeInTheDocument()
  })

  it('should render connection status', () => {
    render(<MessageThread {...mockProps} />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('should render messages from conversation', () => {
    render(<MessageThread {...mockProps} />)

    expect(screen.getByText('Hello there!')).toBeInTheDocument()
    expect(screen.getByText('Hi back!')).toBeInTheDocument()
  })

  it('should join conversation on mount', () => {
    render(<MessageThread {...mockProps} />)

    expect(mockUseSocket.joinConversation).toHaveBeenCalledWith('conv_1')
  })

  it('should send message when form is submitted', async () => {
    const user = userEvent.setup()
    render(<MessageThread {...mockProps} />)

    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Test message')
    await user.click(sendButton)

    expect(mockUseSocket.sendMessage).toHaveBeenCalledWith({
      conversationId: 'conv_1',
      content: 'Test message',
      type: 'text',
      replyToId: undefined,
    })
  })

  it('should send message on Enter key press', async () => {
    const user = userEvent.setup()
    render(<MessageThread {...mockProps} />)

    const input = screen.getByPlaceholderText('Type your message...')

    await user.type(input, 'Test message{enter}')

    expect(mockUseSocket.sendMessage).toHaveBeenCalledWith({
      conversationId: 'conv_1',
      content: 'Test message',
      type: 'text',
      replyToId: undefined,
    })
  })

  it('should not send empty messages', async () => {
    const user = userEvent.setup()
    render(<MessageThread {...mockProps} />)

    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.click(sendButton)

    expect(mockUseSocket.sendMessage).not.toHaveBeenCalled()
  })

  it('should start typing when user types', async () => {
    const user = userEvent.setup()
    render(<MessageThread {...mockProps} />)

    const input = screen.getByPlaceholderText('Type your message...')

    await user.type(input, 'T')

    expect(mockUseSocket.startTyping).toHaveBeenCalledWith('conv_1')
  })

  it('should handle reply to message', async () => {
    const user = userEvent.setup()
    render(<MessageThread {...mockProps} />)

    const replyButtons = screen.getAllByText('Reply')
    await user.click(replyButtons[0])

    expect(screen.getByText(/Replying to:/)).toBeInTheDocument()
    
    const input = screen.getByPlaceholderText('Type your message...')
    await user.type(input, 'Reply message{enter}')

    expect(mockUseSocket.sendMessage).toHaveBeenCalledWith({
      conversationId: 'conv_1',
      content: 'Reply message',
      type: 'text',
      replyToId: 'msg_1',
    })
  })

  it('should disable input when disconnected', () => {
    const disconnectedSocket = {
      ...mockUseSocket,
      isConnected: false,
    }

    vi.mocked(require('@/hooks/use-socket').useSocket).mockReturnValue(disconnectedSocket)

    render(<MessageThread {...mockProps} />)

    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('should show typing indicator when others are typing', () => {
    const typingSocket = {
      ...mockUseSocket,
      typingUsers: [{ userId: 'user_2', isTyping: true }],
    }

    vi.mocked(require('@/hooks/use-socket').useSocket).mockReturnValue(typingSocket)

    render(<MessageThread {...mockProps} />)

    expect(screen.getByText('Someone is typing...')).toBeInTheDocument()
  })
})