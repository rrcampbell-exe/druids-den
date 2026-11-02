import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Gallery } from '../../src/pages/PublicPages'

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>)

describe('Gallery', () => {
  it('presents the new room and loft photographs in the Inside collection', () => {
    renderWithRouter(<Gallery />)

    fireEvent.click(screen.getByRole('button', { name: 'Inside' }))

    expect(screen.getByRole('button', { name: 'View The main living area, kitchen, and open loft' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The kitchen and island countertop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The private bedroom in morning light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The open loft above the main living space' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The bathroom interior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The bookshelf corner' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View A quiet corner of the open loft' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View Small signs of care' })).not.toBeInTheDocument()
  })

  it('opens and closes the lightbox for a new interior photograph', () => {
    renderWithRouter(<Gallery />)

    const trigger = screen.getByRole('button', { name: 'View The bookshelf corner' })
    fireEvent.click(trigger)

    expect(screen.getByRole('dialog', { name: 'The bookshelf corner' })).toBeInTheDocument()
    const closeButton = screen.getByRole('button', { name: 'Close' })
    expect(closeButton).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(window, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })
})