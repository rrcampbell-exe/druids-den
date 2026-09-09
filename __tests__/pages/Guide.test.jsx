import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Guide } from '../../src/pages/Guide'

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>)

describe('Guest guide', () => {
  it('shows confirmed arrival and departure logistics', () => {
    renderWithRouter(<Guide />)

    expect(screen.getByRole('heading', { name: 'Arrival' })).toBeInTheDocument()
    expect(screen.getByText('4 p.m.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByText('10 a.m.')).toBeInTheDocument()
    expect(screen.getByText(/Take all trash, recyclables, food, and personal items with you/)).toBeInTheDocument()
    expect(screen.getByText(/no dirty dishes/)).toBeInTheDocument()
    expect(screen.getByText(/door open a crack so air can circulate/)).toBeInTheDocument()
    expect(screen.getByText(/nonessential appliances/)).toBeInTheDocument()
    expect(screen.getByText(/Close and lock the doors and windows/)).toBeInTheDocument()
  })
})
