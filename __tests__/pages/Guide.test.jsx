import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Guide } from '../../src/pages/Guide'

const renderWithRouter = (component) => render(<MemoryRouter initialEntries={['/guide']}>{component}</MemoryRouter>)

describe('Guest guide', () => {
  it('uses the shared site frame and provides practical guest instructions', () => {
    renderWithRouter(<Guide />)

    expect(screen.getByRole('link', { name: 'The Druids Den home' })).toHaveAttribute('href', '/')
    const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' })
    const guideNavigationLink = within(primaryNavigation).getByRole('link', { name: 'Guest guide' })
    expect(guideNavigationLink).toHaveAttribute('href', '/guide')
    expect(guideNavigationLink).toHaveAttribute('aria-current', 'page')
    expect(primaryNavigation).not.toHaveClass('is-open')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Guest guide' })).toHaveAttribute('href', '/guide')

    expect(screen.getByRole('heading', { name: 'Arrival' })).toBeInTheDocument()
    expect(screen.getByText('Everything you need for a comfortable stay at the Den.')).toBeInTheDocument()
    expect(document.querySelector('.guide-quick-nav')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Find Wi-Fi details' })).toHaveAttribute('href', '#wifi')
    expect(screen.getByText('Check-in begins at 4 p.m. Follow the arrival instructions provided for your reservation.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByText('Checkout is at 10 a.m. Follow the departure instructions provided for your reservation.')).toBeInTheDocument()
    expect(screen.getByText(/four vehicles, including trailers/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'High-water alarm' })).toBeInTheDocument()
    expect(screen.getByText(/beneath the NTI boilers/)).toBeInTheDocument()
    expect(screen.getByText(/even if the alarm stays quiet/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download the high-water warning instructions (PDF)' })).toHaveAttribute('href', '/assets/pdfs/Druids-Den-High-Water-Warning.pdf')
    expect(screen.getByRole('heading', { name: 'Projector setup' })).toBeInTheDocument()
    expect(screen.getByText('Watch one of the supplied DVDs or connect your compatible device for movie night. For streaming, connect your compatible device to the internet and to the projector using the appropriate cable or adapter.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cookware & coffee maker' })).toBeInTheDocument()
    expect(screen.getByText('Cookware, a coffee maker, and a kettle are available in the kitchen.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download the projector setup PDF' })).toHaveAttribute('href', '/assets/pdfs/Druids-Den-Projector-Setup.pdf')
    expect(screen.getByRole('link', { name: 'Download the outdoor recreation guide PDF' })).toHaveAttribute('href', '/assets/pdfs/Druids-Den-Outdoor-Recreation-Regulations.pdf')
    expect(screen.getByText('Find the Wi-Fi network name and password in your reservation arrival information and in the cabin on the refrigerator and in the loft.')).toBeInTheDocument()
    expect(screen.getByText(/For guest support, use the contact information provided with your reservation/)).toBeInTheDocument()
    expect(screen.getByText(/Use the cabin address in your arrival information or posted cabin instructions/)).toBeInTheDocument()
    expect(screen.queryByText(/provisional|existing check-in|existing checkout|have not been verified|not a 24-hour|public guide|public site|already invited|already arriving|invitation|guest-only|guest only/i)).not.toBeInTheDocument()
    expect(document.querySelector('.site-header-guide')).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/(?:wi-?fi)\s*(?:password|passphrase|network name)\s*:\s*\S+/i)
    expect(document.body.textContent).not.toMatch(/\bVITE_GUIDE_/i)

    const menuButton = document.querySelector('.site-menu-toggle')
    expect(menuButton).toBeInTheDocument()
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(primaryNavigation).toHaveClass('is-open')
    fireEvent.click(guideNavigationLink)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

})
