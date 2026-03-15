import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useCurrentAppUser } from '../../src/hooks/useCurrentAppUser'

const useAuthMock = vi.fn()

vi.mock('@clerk/react', () => ({
  useAuth: () => useAuthMock(),
}))

const HookProbe = () => {
  const { user, loading, error, refresh } = useCurrentAppUser()
  const [refreshResult, setRefreshResult] = React.useState('not-called')

  return (
    <div>
      <span data-testid='loading'>{String(loading)}</span>
      <span data-testid='error'>{error}</span>
      <span data-testid='user'>{user ? user.email : 'none'}</span>
      <span data-testid='refresh-result'>{refreshResult}</span>
      <button
        data-testid='refresh'
        onClick={async () => {
          const result = await refresh()
          setRefreshResult(result ? result.email : 'none')
        }}
      >
        Refresh
      </button>
    </div>
  )
}

describe('useCurrentAppUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('stops loading immediately when Clerk is not ready', async () => {
    useAuthMock.mockReturnValue({ isLoaded: false, isSignedIn: false, getToken: vi.fn() })

    render(<HookProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('none')
    })
  })

  it('returns no user when signed out', async () => {
    useAuthMock.mockReturnValue({ isLoaded: true, isSignedIn: false, getToken: vi.fn() })

    render(<HookProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('')
    })
  })

  it('loads the current app user when signed in', async () => {
    useAuthMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn().mockResolvedValue('token'),
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { email: 'guest@example.com' } }),
    })

    render(<HookProbe />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/status', {
        headers: { Authorization: 'Bearer token' },
      })
      expect(screen.getByTestId('user')).toHaveTextContent('guest@example.com')
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
  })

  it('surfaces API errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    useAuthMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn().mockResolvedValue('token'),
    })
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No account found' }),
    })

    render(<HookProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('No account found')
      expect(screen.getByTestId('user')).toHaveTextContent('none')
    })

    consoleSpy.mockRestore()
  })

  it('shows a helpful message when account status response is not JSON', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    useAuthMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn().mockResolvedValue('token'),
    })

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token 'i'")
      },
    })

    render(<HookProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Account service returned an unexpected response. Run `npm start` (Vercel dev) so /api routes are available.',
      )
    })

    consoleSpy.mockRestore()
  })

  it('shows a dev-mode error when the response content type is not JSON', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    useAuthMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn().mockResolvedValue('token'),
    })

    fetch.mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'text/html; charset=utf-8',
      },
      json: vi.fn(),
    })

    render(<HookProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Account service is unavailable in this dev mode. Run `npm start` (Vercel dev) instead of `npm run dev`.',
      )
    })

    consoleSpy.mockRestore()
  })

  it('refreshes and returns the latest user data', async () => {
    useAuthMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn().mockResolvedValue('token'),
    })

    fetch
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({ user: { email: 'first@example.com' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json; charset=utf-8',
        },
        json: async () => ({ user: { email: 'updated@example.com' } }),
      })

    render(<HookProbe />)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('first@example.com')
    })

    fireEvent.click(screen.getByTestId('refresh'))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('updated@example.com')
      expect(screen.getByTestId('refresh-result')).toHaveTextContent('updated@example.com')
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })
})
