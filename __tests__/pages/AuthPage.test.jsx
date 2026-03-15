import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

const signInMock = vi.fn((props) => <div data-testid='sign-in'>{JSON.stringify(props)}</div>)
const signUpMock = vi.fn((props) => <div data-testid='sign-up'>{JSON.stringify(props)}</div>)

vi.mock('@clerk/react', () => ({
  SignIn: (props) => signInMock(props),
  SignUp: (props) => signUpMock(props),
}))

vi.mock('../../src/components', async () => {
  const actual = await vi.importActual('../../src/components/index.jsx')
  return {
    ...actual,
    Awen: () => <span>Awen</span>,
  }
})

import AuthPage from '../../src/pages/AuthPage'

describe('AuthPage', () => {
  const renderPage = (mode = 'sign-in', path = '/sign-in?redirect=%2Fdashboard') => render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/sign-in' element={<AuthPage mode={mode} />} />
        <Route path='/sign-up' element={<AuthPage mode={mode} />} />
      </Routes>
    </MemoryRouter>,
  )

  it('renders the sign-in Clerk widget with redirect-aware links', () => {
    renderPage('sign-in')

    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
    expect(signInMock).toHaveBeenCalledWith(expect.objectContaining({
      fallbackRedirectUrl: '/dashboard',
      signUpUrl: '/sign-up?redirect=%2Fdashboard',
    }))
  })

  it('renders the sign-up Clerk widget and falls back to reservations', () => {
    renderPage('sign-up', '/sign-up')

    expect(signUpMock).toHaveBeenCalledWith(expect.objectContaining({
      fallbackRedirectUrl: '/reservations',
      signInUrl: '/sign-in?redirect=%2Freservations',
    }))
  })
})
