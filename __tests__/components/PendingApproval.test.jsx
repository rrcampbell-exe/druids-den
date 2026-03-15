import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const signOutMock = vi.fn()

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ signOut: signOutMock }),
}))

vi.mock('../../src/components', async () => {
  const actual = await vi.importActual('../../src/components/index.jsx')
  return {
    ...actual,
    Flower: () => <div>Flower</div>,
    Leaf: () => <div>Leaf</div>,
    Awen: () => <span>Awen</span>,
  }
})

import PendingApproval from '../../src/components/PendingApproval'

describe('PendingApproval', () => {
  it('renders pending approval copy by default', () => {
    render(
      <MemoryRouter>
        <PendingApproval />
      </MemoryRouter>,
    )

    expect(screen.getByText('Account Pending Approval')).toBeInTheDocument()
    expect(screen.getByText(/owner still needs to approve/i)).toBeInTheDocument()
  })

  it('renders denied and revoked variants', () => {
    const { rerender } = render(
      <MemoryRouter>
        <PendingApproval accountStatus='DENIED' />
      </MemoryRouter>,
    )

    expect(screen.getByText('Account Access Denied')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <PendingApproval accountStatus='REVOKED' />
      </MemoryRouter>,
    )

    expect(screen.getByText('Reservation Access Revoked')).toBeInTheDocument()
  })

  it('signs out when the button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PendingApproval />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(signOutMock).toHaveBeenCalled()
  })
})
