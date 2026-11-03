import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import Landing from '../../src/pages/Landing'

// Mock components to keep snapshots focused on page structure
vi.mock('../../src/components', () => ({
  Coelbren: ({ children, className, renderAs }) => {
    const Tag = renderAs || 'p'
    return <Tag className={className} data-testid="coelbren">{children}</Tag>
  },
  Awen: () => <span data-testid="awen">Awen</span>,
  Weather: () => <div data-testid="weather">Weather Widget</div>,
}))

describe('Landing Page', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  beforeEach(() => {
    // Mock window.Image
    globalThis.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload()
        }, 0)
      }
    }
  })

  it('renders without crashing', () => {
    renderWithRouter(<Landing />)
    expect(screen.getAllByRole('link', { name: 'Rental stays coming soon' }).length).toBeGreaterThan(0)
  })

  it('matches snapshot', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 1, 12))

    const { container } = renderWithRouter(<Landing />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders main title with Coelbren components', () => {
    renderWithRouter(<Landing />)
    const coelbren = screen.getAllByTestId('coelbren')
    expect(coelbren.length).toBeGreaterThanOrEqual(2)
  })

  it('renders the coming-soon action to the stay page', () => {
    renderWithRouter(<Landing />)
    const link = screen.getAllByText('Rental stays coming soon')[0]
    expect(link.closest('a')).toHaveAttribute('href', '/stay')
  })

  it('renders Weather component', () => {
    renderWithRouter(<Landing />)
    expect(screen.getByTestId('weather')).toBeInTheDocument()
  })

  describe('Image loading', () => {
    it('applies image-loaded class after image loads', async () => {
      const { container } = renderWithRouter(<Landing />)
      
      // Wait for image to load
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const landingPage = container.querySelector('.landing-page')
      expect(landingPage).toHaveClass('image-loaded')
    })
  })
})
