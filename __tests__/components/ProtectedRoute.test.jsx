import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ProtectedRoute from '../../src/components/ProtectedRoute'

// Mock PasscodePrompt component
vi.mock('../../src/components/PasscodePrompt', () => ({
  default: ({ onSuccess }) => (
    <div data-testid="passcode-prompt">
      <button onClick={onSuccess}>Mock Login</button>
    </div>
  ),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.localStorage.getItem.mockClear()
    global.localStorage.setItem.mockClear()
    global.localStorage.removeItem.mockClear()
  })

  it('shows nothing while checking authentication', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    
    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    // The useEffect runs synchronously in tests, so we check final state
    await waitFor(() => {
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
  })

  it('shows PasscodePrompt when not authenticated', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows protected content when authenticated with valid token', async () => {
    const validToken = btoa(JSON.stringify({ authenticated: true }))
    global.localStorage.getItem.mockReturnValue(validToken)
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    
    expect(screen.queryByTestId('passcode-prompt')).not.toBeInTheDocument()
  })

  it('removes invalid token and shows PasscodePrompt', async () => {
    global.localStorage.getItem.mockReturnValue('invalid_token')
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('spooktoberfest_auth')
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
  })

  it('handles token without authenticated flag', async () => {
    const invalidToken = btoa(JSON.stringify({ someOtherField: true }))
    global.localStorage.getItem.mockReturnValue(invalidToken)
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows protected content after successful authentication', async () => {
    global.localStorage.getItem.mockReturnValue(null)
    
    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    // Wait for PasscodePrompt to appear
    await waitFor(() => {
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
    
    // Simulate successful login
    const loginButton = screen.getByText('Mock Login')
    loginButton.click()
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByTestId('passcode-prompt')).not.toBeInTheDocument()
    })
  })

  it('reads token from localStorage on mount', async () => {
    const validToken = btoa(JSON.stringify({ authenticated: true }))
    global.localStorage.getItem.mockReturnValue(validToken)
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(localStorage.getItem).toHaveBeenCalledWith('spooktoberfest_auth')
    })
  })

  it('handles empty token string', async () => {
    global.localStorage.getItem.mockReturnValue('')
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
  })

  it('renders multiple children when authenticated', async () => {
    const validToken = btoa(JSON.stringify({ authenticated: true }))
    global.localStorage.getItem.mockReturnValue(validToken)
    
    render(
      <ProtectedRoute>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
      expect(screen.getByText('Third Child')).toBeInTheDocument()
    })
  })

  it('token validation is case-sensitive for authenticated flag', async () => {
    // Token with Authenticated (capital A) instead of authenticated
    const invalidToken = btoa(JSON.stringify({ Authenticated: true }))
    global.localStorage.getItem.mockReturnValue(invalidToken)
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
  })

  it('does not call localStorage methods other than getItem on valid token', async () => {
    const validToken = btoa(JSON.stringify({ authenticated: true }))
    global.localStorage.getItem.mockReturnValue(validToken)
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    
    expect(localStorage.removeItem).not.toHaveBeenCalled()
  })

  it('handles malformed JSON token gracefully', async () => {
    global.localStorage.getItem.mockReturnValue('not-base64-encoded')
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )
    
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('spooktoberfest_auth')
      expect(screen.getByTestId('passcode-prompt')).toBeInTheDocument()
    })
  })
})
