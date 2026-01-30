import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import Dashboard from '../../src/pages/Dashboard'

// Mock child components
vi.mock('../../src/pages/dashboard/AtAGlance', () => ({
  default: () => <div data-testid="at-a-glance">At A Glance Component</div>
}))

vi.mock('../../src/pages/dashboard/Reports', () => ({
  default: () => <div data-testid="reports">Reports Component</div>
}))

vi.mock('../../src/components', () => ({
  Coelbren: ({ children }) => <span data-testid="coelbren">{children}</span>,
  Awen: () => <span data-testid="awen">Awen</span>,
  Flower: () => <span data-testid="flower">Flower</span>,
  Leaf: () => <span data-testid="leaf">Leaf</span>
}))

describe('Dashboard', () => {
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders without crashing', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Owner Dashboard')).toBeInTheDocument()
  })

  it('renders all three tabs', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('At A Glance')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('shows At A Glance tab as active by default', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('at-a-glance')).toBeInTheDocument()
  })

  it('switches to Reports tab when clicked', () => {
    renderWithRouter(<Dashboard />)
    const reportsTab = screen.getByText('Reports')
    fireEvent.click(reportsTab)
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

  it('renders logout link', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByText('Log Out')).toBeInTheDocument()
  })

  it('renders Coelbren subheading', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('coelbren')).toHaveTextContent('Tending to The Druids Den')
  })

  it('matches snapshot', () => {
    const { container } = renderWithRouter(<Dashboard />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
