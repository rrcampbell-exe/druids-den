import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Guests from '../../../src/pages/dashboard/Guests'

const mockUsers = [
  {
    id: 'guest-1',
    email: 'pending@example.com',
    firstName: 'Pending',
    lastName: 'Guest',
    accountStatus: 'PENDING_APPROVAL',
    createdAt: '2026-03-01T00:00:00.000Z',
    accountStatusChangedAt: null,
  },
  {
    id: 'guest-2',
    email: 'approved@example.com',
    firstName: 'Approved',
    lastName: 'Guest',
    accountStatus: 'APPROVED',
    createdAt: '2026-03-02T00:00:00.000Z',
    accountStatusChangedAt: '2026-03-03T00:00:00.000Z',
  },
]

describe('Guests', () => {
  const getToken = vi.fn().mockResolvedValue('token')

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ users: mockUsers }),
    })
  })

  it('loads and displays guest accounts', async () => {
    render(<Guests getToken={getToken} />)

    expect(screen.getByText('Loading guest accounts...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Guest Approvals')).toBeInTheDocument()
      expect(screen.getByText('Pending (1)')).toBeInTheDocument()
      expect(screen.getByText('Pending Guest')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/users', {
      headers: { Authorization: 'Bearer token' },
    })
  })

  it('switches between status tabs and shows empty state when needed', async () => {
    const user = userEvent.setup()
    render(<Guests getToken={getToken} />)

    await screen.findByText('Guest Approvals')
    await user.click(screen.getByRole('button', { name: 'Approved (1)' }))
    expect(screen.getByText('Approved Guest')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Denied (0)' }))
    expect(screen.getByText('No guests in this status yet.')).toBeInTheDocument()
  })

  it('refreshes the list and updates a guest status', async () => {
    const user = userEvent.setup()
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: mockUsers }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: mockUsers }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            ...mockUsers[0],
            accountStatus: 'APPROVED',
            accountStatusChangedAt: '2026-03-14T00:00:00.000Z',
          },
        }),
      })

    render(<Guests getToken={getToken} />)

    await screen.findByText('Pending Guest')
    await user.click(screen.getByRole('button', { name: /refresh/i }))
    await user.click(screen.getByRole('button', { name: /^approve$/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        body: JSON.stringify({ userId: 'guest-1', accountStatus: 'APPROVED' }),
      })
    })
  })

  it('shows API errors from loading and updating', async () => {
    const user = userEvent.setup()
    fetch
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Load failed' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ users: mockUsers }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Update failed' }) })

    render(<Guests getToken={getToken} />)

    await screen.findByText('Load failed')
    await user.click(screen.getByRole('button', { name: /refresh/i }))
    await screen.findByText('Pending Guest')

    await user.click(screen.getByRole('button', { name: /^approve$/i }))

    await screen.findByText('Update failed')
  })
})
