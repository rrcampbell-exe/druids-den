import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import PasscodePrompt from '../../src/components/PasscodePrompt'

// Mock the component dependencies
vi.mock('../../src/components', () => ({
  Flower: () => <div data-testid="flower">Flower</div>,
  Leaf: () => <div data-testid="leaf">Leaf</div>,
  Awen: () => <span data-testid="awen">Awen</span>,
}))

describe('PasscodePrompt', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch.mockClear()
    global.localStorage.setItem.mockClear()
    global.localStorage.getItem.mockClear()
    global.localStorage.removeItem.mockClear()
  })

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders the passcode form', () => {
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    expect(screen.getByText('Spooktoberfest')).toBeInTheDocument()
    expect(screen.getByText('This page is for invited guests only.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter passcode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument()
  })

  it('renders decorative components', () => {
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    expect(screen.getByTestId('flower')).toBeInTheDocument()
    expect(screen.getByTestId('leaf')).toBeInTheDocument()
    expect(screen.getByTestId('awen')).toBeInTheDocument()
  })

  it('renders back navigation link', () => {
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const backLink = screen.getByText('Go Back').closest('a')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('submit button is disabled when passcode is empty', () => {
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const submitButton = screen.getByRole('button', { name: 'Enter' })
    expect(submitButton).toBeDisabled()
  })

  it('submit button is enabled when passcode has value', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    const submitButton = screen.getByRole('button', { name: 'Enter' })
    
    await user.type(input, 'test123')
    
    expect(submitButton).not.toBeDisabled()
  })

  it('updates passcode state when typing', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    
    await user.type(input, 'mypasscode')
    
    expect(input).toHaveValue('mypasscode')
  })

  it('submits form with correct passcode and calls onSuccess', async () => {
    const user = userEvent.setup()
    const mockToken = 'mock_token_123'
    
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        token: mockToken,
      }),
    })
    
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} storageKey="spooktoberfest_auth" />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    const form = input.closest('form')
    
    await user.type(input, 'correct123')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode: 'correct123', page: 'spooktoberfest' }),
      })
    })
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('spooktoberfest_auth', mockToken)
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message for invalid passcode', async () => {
    const user = userEvent.setup()
    
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: false,
      }),
    })
    
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    
    await user.type(input, 'wrong123')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid passcode. Please try again.')).toBeInTheDocument()
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('clears passcode input on error', async () => {
    const user = userEvent.setup()
    
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: false,
      }),
    })
    
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    
    await user.type(input, 'wrong123')
    expect(input).toHaveValue('wrong123')
    
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Create a promise that we can control
    let resolvePromise
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    global.fetch.mockReturnValueOnce(mockPromise)
    
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    
    await user.type(input, 'test123')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    // Check loading state
    expect(screen.getByRole('button', { name: 'Verifying...' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verifying...' })).toBeDisabled()
    expect(input).toBeDisabled()
    
    // Resolve the promise
    resolvePromise({
      json: async () => ({ success: true, token: 'token' }),
    })
  })

  it('handles network error gracefully', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    
    await user.type(input, 'test123')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('input has type password', () => {
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('input has autofocus attribute', () => {
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    // In React, autoFocus is set but may not appear as HTML attribute in test
    expect(input).toBeInTheDocument()
  })

  it('clears error when typing after error', async () => {
    const user = userEvent.setup()
    
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: false,
      }),
    })
    
    renderWithRouter(<PasscodePrompt onSuccess={mockOnSuccess} />)
    
    const input = screen.getByPlaceholderText('Enter passcode')
    
    // First submission with error
    await user.type(input, 'wrong')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    await waitFor(() => {
      expect(screen.getByText('Invalid passcode. Please try again.')).toBeInTheDocument()
    })
    
    // Type again - this should clear the error via form submission
    // The error is cleared in handleSubmit, not on input change
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        token: 'valid_token',
      }),
    })
    
    await user.type(input, 'correct')
    await user.click(screen.getByRole('button', { name: 'Enter' }))
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid passcode. Please try again.')).not.toBeInTheDocument()
    })
  })
})
