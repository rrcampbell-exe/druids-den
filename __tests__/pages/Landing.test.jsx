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
