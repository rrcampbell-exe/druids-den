import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import Dashboard from '../../src/pages/Dashboard'

vi.mock('../../src/pages/dashboard/AtAGlance', () => ({
  default: () => <div data-testid='at-a-glance'>At A Glance Component</div>
}))

vi.mock('../../src/pages/dashboard/Guests', () => ({
  default: () => <div data-testid='guests'>Guests Component</div>
}))

vi.mock('../../src/pages/dashboard/Reports', () => ({
  default: () => <div data-testid='reports'>Reports Component</div>
}))

vi.mock('../../src/hooks/useCurrentAppUser', () => ({
  useCurrentAppUser: () => ({
    user: {
      id: 'owner-1',
      email: 'owner@example.com',
      role: 'OWNER',
      accountStatus: 'APPROVED',
    },
  }),
}))

vi.mock('../../src/components', () => ({
  Coelbren: ({ children }) => <span data-testid='coelbren'>{children}</span>,
  Awen: () => <span data-testid='awen'>Awen</span>,
  AuthHeader: () => <div data-testid='auth-header'>Auth Header</div>,
}))

describe('Dashboard', () => {
  const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>)

  it('renders without crashing', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Owner Dashboard')).toBeInTheDocument()
  })

  it('renders all four tabs', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('At A Glance')).toBeInTheDocument()
    expect(screen.getByText('Guests')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('shows At A Glance tab as active by default', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('at-a-glance')).toBeInTheDocument()
  })

  it('switches to Guests tab when clicked', () => {
    renderWithRouter(<Dashboard />)
    fireEvent.click(screen.getByText('Guests'))
    expect(screen.getByTestId('guests')).toBeInTheDocument()
  })

  it('switches to Reports tab when clicked', () => {
    renderWithRouter(<Dashboard />)
    fireEvent.click(screen.getByText('Reports'))
    expect(screen.getByTestId('reports')).toBeInTheDocument()
  })

  it('shows Coming Soon badge on Insights tab', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })

  it('disables Insights tab', () => {
    renderWithRouter(<Dashboard />)
    const insightsTab = screen.getByText('Insights').closest('button')
    expect(insightsTab).toBeDisabled()
  })

  it('renders back home link', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Back Home')).toBeInTheDocument()
  })

  it('renders auth header', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('auth-header')).toBeInTheDocument()
  })

  it('renders Coelbren subheading', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('coelbren')).toHaveTextContent('Tending to The Druids Den')
  })
})
