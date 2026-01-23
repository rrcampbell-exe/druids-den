import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import WhatToExpect from '../../src/pages/WhatToExpect'

// Mock components to keep snapshots clean
vi.mock('../../src/components', () => ({
  Coelbren: ({ children, className, renderAs }) => {
    const Tag = renderAs || 'p'
    return <Tag className={className} data-testid="coelbren">{children}</Tag>
  },
  Awen: () => <span data-testid="awen">Awen</span>,
  Flower: () => <span data-testid="flower">Flower</span>,
  Leaf: () => <span data-testid="leaf">Leaf</span>,
  PageNav: ({ items, title }) => (
    <nav data-testid="page-nav">
      <h3>{title}</h3>
      {items.map(item => <div key={item.href}>{item.label}</div>)}
    </nav>
  ),
  CaptionedImage: ({ src, alt }) => (
    <figure data-testid="captioned-image">
      <img src={src} alt={alt} />
      <figcaption>{alt}</figcaption>
    </figure>
  ),
}))

describe('WhatToExpect Page', () => {
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  it('renders without crashing', () => {
    renderWithRouter(<WhatToExpect />)
    expect(screen.getByText('What To Expect')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = renderWithRouter(<WhatToExpect />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('renders page header with title', () => {
    renderWithRouter(<WhatToExpect />)
    expect(screen.getByRole('heading', { name: 'What To Expect' })).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderWithRouter(<WhatToExpect />)
    expect(screen.getByText('Your Guide to The Druids Den')).toBeInTheDocument()
  })

  it('renders navigation with correct items', () => {
    renderWithRouter(<WhatToExpect />)
    
    // Navigation items also appear as section headings, so we expect multiple
    expect(screen.getAllByText('The Cabin').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Year-Round Essentials').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Spring').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Summer').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Fall').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Winter').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('The Area').length).toBeGreaterThanOrEqual(1)
  })

  it('renders back navigation link', () => {
    renderWithRouter(<WhatToExpect />)
    
    const backLink = screen.getByText('Go Back').closest('a')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('renders PageNav component', () => {
    renderWithRouter(<WhatToExpect />)
    expect(screen.getByTestId('page-nav')).toBeInTheDocument()
  })

  it('renders Coelbren subtitle', () => {
    renderWithRouter(<WhatToExpect />)
    const coelbren = screen.getAllByTestId('coelbren')
    expect(coelbren.length).toBeGreaterThan(0)
  })

  it('renders multiple CaptionedImage components', () => {
    renderWithRouter(<WhatToExpect />)
    const images = screen.getAllByTestId('captioned-image')
    expect(images.length).toBeGreaterThan(0)
  })
})
