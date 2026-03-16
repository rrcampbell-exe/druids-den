import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import Landing from '../../src/pages/Landing'

const useCurrentAppUserMock = vi.fn()

vi.mock('../../src/hooks/useCurrentAppUser', () => ({
  useCurrentAppUser: () => useCurrentAppUserMock(),
}))

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
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  beforeEach(() => {
    useCurrentAppUserMock.mockReturnValue({
      user: { role: 'OWNER' },
      loading: false,
      error: '',
    })

    // Mock window.Image
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload()
        }, 0)
      }
    }
  })

  it('renders without crashing', () => {
    renderWithRouter(<Landing />)
    expect(screen.getByText('Begin Your Northwoods Adventure >')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = renderWithRouter(<Landing />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders main title with Coelbren components', () => {
    renderWithRouter(<Landing />)
    const coelbren = screen.getAllByTestId('coelbren')
    expect(coelbren.length).toBeGreaterThanOrEqual(2)
  })

  it('renders link to what-to-expect page', () => {
    renderWithRouter(<Landing />)
    const link = screen.getByText('Begin Your Northwoods Adventure >')
    expect(link.closest('a')).toHaveAttribute('href', '/what-to-expect')
  })

  it('renders Weather component', () => {
    renderWithRouter(<Landing />)
    expect(screen.getByTestId('weather')).toBeInTheDocument()
  })

  it('shows Owner Dashboard link for authenticated owners', () => {
    renderWithRouter(<Landing />)
    const link = screen.getByText('Owner Dashboard >')
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard')
  })

  it('shows Owner Dashboard link for authenticated admins', () => {
    useCurrentAppUserMock.mockReturnValue({
      user: { role: 'ADMIN' },
      loading: false,
      error: '',
    })

    renderWithRouter(<Landing />)
    const link = screen.getByText('Owner Dashboard >')
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard')
  })

  it('hides Owner Dashboard link for non-owner users', () => {
    useCurrentAppUserMock.mockReturnValue({
      user: { role: 'GUEST' },
      loading: false,
      error: '',
    })

    renderWithRouter(<Landing />)
    expect(screen.queryByText('Owner Dashboard >')).not.toBeInTheDocument()
  })

  describe('Spooktoberfest conditional rendering', () => {
    it('shows Spooktoberfest link when date is April 2026 or later', () => {
      // Mock date to be after April 1, 2026
      vi.setSystemTime(new Date('2026-04-15'))
      
      renderWithRouter(<Landing />)
      
      const link = screen.getByText('Spooktoberfest 2026 >')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/spooktoberfest')
      
      vi.useRealTimers()
    })

    it('hides Spooktoberfest link when date is before April 2026', () => {
      // Mock date to be before April 1, 2026
      vi.setSystemTime(new Date('2026-03-15'))
      
      renderWithRouter(<Landing />)
      
      expect(screen.queryByText('Spooktoberfest 2026 >')).not.toBeInTheDocument()
      
      vi.useRealTimers()
    })

    it('shows Spooktoberfest link on exactly April 1, 2026', () => {
      vi.setSystemTime(new Date('2026-04-01'))
      
      renderWithRouter(<Landing />)
      
      expect(screen.getByText('Spooktoberfest 2026 >')).toBeInTheDocument()
      
      vi.useRealTimers()
    })

    it('hides Spooktoberfest link on March 31, 2026', () => {
      vi.setSystemTime(new Date('2026-03-31'))
      
      renderWithRouter(<Landing />)
      
      expect(screen.queryByText('Spooktoberfest 2026 >')).not.toBeInTheDocument()
      
      vi.useRealTimers()
    })
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
