import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import Reservations from '../../src/pages/Reservations'

describe('Reservations', () => {
  let fetchSpy

  beforeEach(() => {
    // Mock scrollIntoView for input elements
    Element.prototype.scrollIntoView = vi.fn()
    
    fetchSpy = vi.spyOn(global, 'fetch')
    
    // Mock blackout dates response
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        blackoutDates: ['2026-06-10', '2026-06-11']
      })
    })
  })

  afterEach(() => {
    fetchSpy.mockClear()
    vi.restoreAllMocks()
  })

  it('renders reservation form', async () => {
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    expect(screen.getByText('Reservations')).toBeInTheDocument()
    expect(screen.getByText('Your Northwoods Retreat Awaits')).toBeInTheDocument()
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument()
  })

  it('loads blackout dates on mount', async () => {
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/blackout-dates.json')
    })
  })

  it('handles blackout dates fetch error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchSpy.mockReset()
    fetchSpy.mockRejectedValue(new Error('Network error'))
    
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading blackout dates:',
        expect.any(Error)
      )
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const emailInput = screen.getByLabelText('Email Address *')
    
    await user.type(emailInput, 'invalid-email')
    await user.tab()
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('accepts valid email', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const emailInput = screen.getByLabelText('Email Address *')
    
    await user.type(emailInput, 'valid@example.com')
    await user.tab()
    
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
  })

  it('validates phone format', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const phoneInput = screen.getByLabelText('Phone Number *')
    
    await user.type(phoneInput, '123')
    await user.tab()
    
    expect(screen.getByText('Please enter a valid 10-digit US phone number')).toBeInTheDocument()
  })

  it('formats phone number', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const phoneInput = screen.getByLabelText('Phone Number *')
    
    await user.type(phoneInput, '5551234567')
    
    expect(phoneInput.value).toBe('(555) 123-4567')
  })

  it('accepts valid phone number', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const phoneInput = screen.getByLabelText('Phone Number *')
    
    await user.type(phoneInput, '5551234567')
    await user.tab()
    
    expect(screen.queryByText('Please enter a valid 10-digit US phone number')).not.toBeInTheDocument()
  })

  it('updates form fields on input', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const firstNameInput = screen.getByLabelText('First Name *')
    const lastNameInput = screen.getByLabelText('Last Name *')
    
    await user.type(firstNameInput, 'John')
    await user.type(lastNameInput, 'Doe')
    
    expect(firstNameInput.value).toBe('John')
    expect(lastNameInput.value).toBe('Doe')
  })

  it('updates adults and children count', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const adultsInput = screen.getByLabelText('Adults *')
    const childrenInput = screen.getByLabelText('Children')
    
    await user.clear(adultsInput)
    await user.type(adultsInput, '2')
    await user.type(childrenInput, '1')
    
    expect(adultsInput.value).toBe('2')
    expect(childrenInput.value).toBe('1')
  })

  it('updates special requests', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const textarea = screen.getByLabelText(/Anything else we should know/)
    
    await user.type(textarea, 'Early check-in please')
    
    expect(textarea.value).toBe('Early check-in please')
  })

  it('prevents submission with invalid email', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    // Fill required fields with invalid email
    await user.type(screen.getByLabelText('First Name *'), 'John')
    await user.type(screen.getByLabelText('Last Name *'), 'Doe')
    await user.type(screen.getByLabelText('Email Address *'), 'invalid')
    await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
    
    // Try to submit
    const form = screen.getByRole('button', { name: /Submit Reservation Request/ })
    await user.click(form)
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('prevents submission with invalid phone', async () => {
    const user = userEvent.setup()
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    // Fill required fields with invalid phone
    await user.type(screen.getByLabelText('First Name *'), 'John')
    await user.type(screen.getByLabelText('Last Name *'), 'Doe')
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com')
    await user.type(screen.getByLabelText('Phone Number *'), '123')
    
    // Try to submit
    const form = screen.getByRole('button', { name: /Submit Reservation Request/ })
    await user.click(form)
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit US phone number')).toBeInTheDocument()
    })
  })

  it('renders navigation', () => {
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    expect(screen.getByText(/Go Back/)).toBeInTheDocument()
  })

  it('renders page sections', () => {
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    const sections = screen.getAllByRole('heading', { level: 2 })
    const sectionTexts = sections.map(s => s.textContent)
    
    expect(sectionTexts).toContain('Your Information')
    expect(sectionTexts).toContain('Reservation Details')
    expect(sectionTexts).toContain('Additional Notes')
  })

  it('includes disclaimer text', () => {
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    expect(screen.getByText(/By submitting this form/)).toBeInTheDocument()
  })

  it('renders date picker component', () => {
    render(<BrowserRouter><Reservations /></BrowserRouter>)
    
    expect(screen.getByText(/Dates of Reservation/)).toBeInTheDocument()
  })
})
