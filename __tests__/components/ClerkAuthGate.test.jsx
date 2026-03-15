import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

const useAuthMock = vi.fn()
const useCurrentAppUserMock = vi.fn()

vi.mock('@clerk/react', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('../../src/hooks/useCurrentAppUser', () => ({
  useCurrentAppUser: () => useCurrentAppUserMock(),
}))

vi.mock('../../src/components', async () => {
  const actual = await vi.importActual('../../src/components/index.jsx')
  return {
    ...actual,
    Flower: () => <div>Flower</div>,
    Leaf: () => <div>Leaf</div>,
  }
})

import ClerkAuthGate from '../../src/components/ClerkAuthGate'

describe('ClerkAuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: true })
    useCurrentAppUserMock.mockReturnValue({
      user: { role: 'OWNER', accountStatus: 'APPROVED' },
      loading: false,
      error: '',
    })
  })

  const renderGate = (props = {}) => render(
    <MemoryRouter initialEntries={['/dashboard?tab=guests']}>
      <Routes>
        <Route
          path='/dashboard'
          element={(
            <ClerkAuthGate {...props}>
              <div>Protected Content</div>
            </ClerkAuthGate>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )

  it('renders nothing before Clerk finishes loading', () => {
    useAuthMock.mockReturnValue({ isLoaded: false, isSignedIn: false })
    const { container } = renderGate()
    expect(container.firstChild).toBeNull()
  })

  it('prompts signed-out users to sign in or create an account', () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: false })

    renderGate()

    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in?redirect=%2Fdashboard%3Ftab%3Dguests')
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/sign-up?redirect=%2Fdashboard%3Ftab%3Dguests')
  })

  it('shows an account load error', () => {
    useCurrentAppUserMock.mockReturnValue({ user: null, loading: false, error: 'Load failed' })

    renderGate()

    expect(screen.getByText("We couldn't load your account")).toBeInTheDocument()
    expect(screen.getByText('Load failed')).toBeInTheDocument()
  })

  it('shows the pending approval screen when approval is required', () => {
    useCurrentAppUserMock.mockReturnValue({
      user: { role: 'GUEST', accountStatus: 'PENDING_APPROVAL' },
      loading: false,
      error: '',
    })

    renderGate({ requireApproval: true })

    expect(screen.getByText('Account Pending Approval')).toBeInTheDocument()
  })

  it('blocks users without the required role', () => {
    useCurrentAppUserMock.mockReturnValue({
      user: { role: 'GUEST', accountStatus: 'APPROVED' },
      loading: false,
      error: '',
    })

    renderGate({ requiredRoles: ['OWNER', 'ADMIN'] })

    expect(screen.getByText('Access restricted')).toBeInTheDocument()
  })

  it('renders protected children when access is allowed', () => {
    renderGate({ requireApproval: true, requiredRoles: ['OWNER'] })
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
