import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const useUserMock = vi.fn()

vi.mock('@clerk/react', () => ({
  UserButton: (props) => <div data-testid='user-button'>{props.afterSignOutUrl}</div>,
  useUser: () => useUserMock(),
}))

import AuthHeader from '../../src/components/AuthHeader'

describe('AuthHeader', () => {
  it('renders nothing until the user is loaded', () => {
    useUserMock.mockReturnValue({ isLoaded: false, user: null })
    const { container } = render(<AuthHeader />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the signed-in user name and user button', () => {
    useUserMock.mockReturnValue({
      isLoaded: true,
      user: {
        firstName: 'Guest',
        lastName: 'User',
        primaryEmailAddress: { emailAddress: 'guest@example.com' },
      },
    })

    render(<AuthHeader />)

    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByText('Guest User')).toBeInTheDocument()
    expect(screen.getByTestId('user-button')).toHaveTextContent('/')
  })

  it('falls back to the primary email when no name is available', () => {
    useUserMock.mockReturnValue({
      isLoaded: true,
      user: {
        firstName: '',
        lastName: '',
        primaryEmailAddress: { emailAddress: 'guest@example.com' },
      },
    })

    render(<AuthHeader />)

    expect(screen.getByText('guest@example.com')).toBeInTheDocument()
  })
})
