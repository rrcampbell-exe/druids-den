import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import Spooktoberfest from '../../src/pages/Spooktoberfest'

// Mock components to keep snapshots clean
vi.mock('../../src/components', () => ({
  Coelbren: ({ children, className, renderAs }) => {
    const Tag = renderAs || 'p'
    return <Tag className={className} data-testid="coelbren">{children}</Tag>
  },
  Awen: () => <span data-testid="awen">Awen</span>,
  Flower: () => <span data-testid="flower">Flower</span>,
  Leaf: () => <span data-testid="leaf">Leaf</span>,
  CaptionedImage: ({ src, alt }) => (
    <figure data-testid="captioned-image">
      <img src={src} alt={alt} />
      <figcaption>{alt}</figcaption>
    </figure>
  ),
}))

describe('Spooktoberfest Page', () => {
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders without crashing', () => {
    renderWithRouter(<Spooktoberfest />)
    expect(screen.getByRole('heading', { name: 'Spooktoberfest', level: 1 })).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = renderWithRouter(<Spooktoberfest />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders page header with title', () => {
    renderWithRouter(<Spooktoberfest />)
    expect(screen.getByRole('heading', { name: 'Spooktoberfest' })).toBeInTheDocument()
  })

  it('renders event date', () => {
    renderWithRouter(<Spooktoberfest />)
    expect(screen.getByText('October 8th - 11th, 2026')).toBeInTheDocument()
  })

  it('renders back navigation link', () => {
    renderWithRouter(<Spooktoberfest />)
    
    const backLink = screen.getByText('Go Back').closest('a')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('renders Coelbren subtitle', () => {
    renderWithRouter(<Spooktoberfest />)
    const coelbren = screen.getAllByTestId('coelbren')
    expect(coelbren.length).toBeGreaterThan(0)
  })
})
