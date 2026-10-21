import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { SiteHeader } from '../../../src/components/site/SiteComponents'

describe('SiteHeader Spooktoberfest navigation', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    [new Date(2027, 2, 31, 12), false],
    [new Date(2027, 3, 1, 12), true],
    [new Date(2027, 9, 15, 12), true],
    [new Date(2027, 9, 16, 12), false],
  ])('uses the seasonal window for %s', (date, isVisible) => {
    vi.useFakeTimers()
    vi.setSystemTime(date)

    render(<BrowserRouter><SiteHeader /></BrowserRouter>)

    const link = screen.queryByRole('link', { name: 'Spooktoberfest' })
    expect(Boolean(link)).toBe(isVisible)
  })

  it('shows the seasonal link in the mobile menu when it is open', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2027, 6, 1, 12))

    render(<BrowserRouter><SiteHeader /></BrowserRouter>)

    const menuButton = document.querySelector('.site-menu-toggle')
    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('primary-navigation')).toHaveClass('is-open')
    expect(screen.getByRole('link', { name: 'Spooktoberfest' })).toBeInTheDocument()
  })
})