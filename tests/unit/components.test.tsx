import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock UI Components for testing
function MockButton({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )
}

function MockInput({
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  ...props
}: {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      {...props}
    />
  )
}

function MockCard({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div data-testid="card" className={className}>
      {children}
    </div>
  )
}

describe('UI Components', () => {
  describe('Button', () => {
    it('renders with correct text', () => {
      render(<MockButton>Click me</MockButton>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<MockButton onClick={handleClick}>Click me</MockButton>)

      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('can be disabled', () => {
      const handleClick = vi.fn()
      render(
        <MockButton onClick={handleClick} disabled>
          Click me
        </MockButton>
      )

      const button = screen.getByText('Click me')
      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('applies variant styles', () => {
      render(<MockButton variant="destructive">Delete</MockButton>)
      const button = screen.getByText('Delete')
      expect(button).toHaveAttribute('data-variant', 'destructive')
    })
  })

  describe('Input', () => {
    it('renders with placeholder', () => {
      render(<MockInput placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('handles value changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(
        <MockInput
          placeholder="Email"
          onChange={handleChange}
        />
      )

      const input = screen.getByPlaceholderText('Email')
      await user.type(input, 'test@example.com')

      expect(handleChange).toHaveBeenCalled()
    })

    it('supports different input types', () => {
      render(<MockInput type="email" placeholder="Email" />)
      const input = screen.getByPlaceholderText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('can be required', () => {
      render(<MockInput placeholder="Required field" required />)
      const input = screen.getByPlaceholderText('Required field')
      expect(input).toBeRequired()
    })
  })

  describe('Card', () => {
    it('renders children content', () => {
      render(
        <MockCard>
          <h2>Card Title</h2>
          <p>Card content</p>
        </MockCard>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<MockCard className="custom-class">Content</MockCard>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })
  })
})

describe('Form Validation', () => {
  it('validates email format', async () => {
    const user = userEvent.setup()

    render(
      <form>
        <MockInput type="email" placeholder="Email" required />
        <MockButton type="submit">Submit</MockButton>
      </form>
    )

    const input = screen.getByPlaceholderText('Email')
    const submitButton = screen.getByText('Submit')

    // Test invalid email
    await user.type(input, 'invalid-email')
    fireEvent.click(submitButton)

    // Browser's built-in validation should prevent submission
    expect(input).toBeInvalid()
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn((e) => e.preventDefault())

    render(
      <form onSubmit={handleSubmit}>
        <MockInput type="email" placeholder="Email" required />
        <MockInput type="text" placeholder="Name" required />
        <MockButton type="submit">Submit</MockButton>
      </form>
    )

    const emailInput = screen.getByPlaceholderText('Email')
    const nameInput = screen.getByPlaceholderText('Name')
    const submitButton = screen.getByText('Submit')

    await user.type(emailInput, 'test@example.com')
    await user.type(nameInput, 'Test User')
    fireEvent.click(submitButton)

    expect(handleSubmit).toHaveBeenCalledOnce()
  })
})

describe('Accessibility', () => {
  it('button has proper accessibility attributes', () => {
    render(
      <MockButton aria-label="Close modal">
        ×
      </MockButton>
    )

    const button = screen.getByLabelText('Close modal')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAccessibleName('Close modal')
  })

  it('input has proper labels', () => {
    render(
      <div>
        <label htmlFor="email-input">Email Address</label>
        <MockInput id="email-input" type="email" />
      </div>
    )

    const input = screen.getByLabelText('Email Address')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAccessibleName('Email Address')
  })

  it('form has proper structure', () => {
    render(
      <form role="form" aria-label="Contact form">
        <fieldset>
          <legend>Personal Information</legend>
          <MockInput placeholder="Name" />
          <MockInput type="email" placeholder="Email" />
        </fieldset>
        <MockButton type="submit">Submit</MockButton>
      </form>
    )

    expect(screen.getByRole('form')).toHaveAccessibleName('Contact form')
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
  })
})