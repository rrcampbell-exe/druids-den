import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Stay } from '../../src/pages/PublicPages'

describe('Stay page', () => {
  it('keeps the coming-soon message concise and offers one general inquiry link', () => {
    render(<BrowserRouter><Stay /></BrowserRouter>)

    expect(document.body.textContent).toMatch(/Rental stays are coming soon\. Booking information will be available here\.|Booking information is available from the listings below\./)
    expect(screen.getAllByRole('link', { name: 'General questions? Reach out by email' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Explore the cabin' })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/verified listing links are not available|does not reserve a stay|inquiry does not confirm/i)
  })
})
