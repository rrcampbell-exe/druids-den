import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Gallery } from '../../src/pages/PublicPages'

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>)

describe('Gallery', () => {
  it('presents the new room and loft photographs in the Inside collection', () => {
    renderWithRouter(<Gallery />)

    fireEvent.click(screen.getByRole('button', { name: 'Inside' }))

    expect(screen.getByRole('button', { name: 'View Entering the heart of the house' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View A table at the heart of the house' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The room that gathers everyone' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View The bookshelf corner' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View Up toward the eaves' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View A quiet corner above the main room' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View Small signs of care' })).not.toBeInTheDocument()
  })

  it('opens and closes the lightbox for a new interior photograph', () => {
    renderWithRouter(<Gallery />)

    fireEvent.click(screen.getByRole('button', { name: 'View The bookshelf corner' }))

    expect(screen.getByRole('dialog', { name: 'The bookshelf corner' })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })
})