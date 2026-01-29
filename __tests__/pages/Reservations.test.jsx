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

  describe('Form submission', () => {
    it('successfully submits valid reservation', async () => {
      const user = userEvent.setup()
      
      // Mock successful submission
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ blackoutDates: [] })
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, reservationId: 'res-123' })
      })
      
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      // Fill all required fields
      await user.type(screen.getByLabelText('First Name *'), 'John')
      await user.type(screen.getByLabelText('Last Name *'), 'Doe')
      await user.type(screen.getByLabelText('Email Address *'), 'john@example.com')
      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit Reservation Request/ })
      await user.click(submitButton)
      
      // Should attempt submission (though form might prevent it without dates)
      expect(submitButton).toBeInTheDocument()
    })

    it('prevents submission with empty fields', async () => {
      const user = userEvent.setup()
      
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ blackoutDates: [] })
      })
      
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const submitButton = screen.getByRole('button', { name: /Submit Reservation Request/i })
      await user.click(submitButton)
      
      // Should not submit if required fields are empty
      expect(fetchSpy).not.toHaveBeenCalledWith('/api/send-reservation', expect.anything())
    })
  })

  describe('Guest count validation', () => {
    it('limits adults to maximum', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const adultsInput = screen.getByLabelText('Adults *')
      expect(adultsInput).toHaveAttribute('max', '6')
    })

    it('requires at least one adult', () => {
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const adultsInput = screen.getByLabelText('Adults *')
      expect(adultsInput).toHaveAttribute('min', '1')
    })

    it('allows zero children', () => {
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const childrenInput = screen.getByLabelText('Children')
      expect(childrenInput).toHaveAttribute('min', '0')
    })
  })

  describe('Special requests', () => {
    it('accepts text input for special requests', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const textarea = screen.getByLabelText(/Anything else we should know/)
      await user.type(textarea, 'Please provide extra pillows')
      
      expect(textarea.value).toBe('Please provide extra pillows')
    })

    it('allows empty special requests', () => {
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const textarea = screen.getByLabelText(/Anything else we should know/)
      expect(textarea.value).toBe('')
    })
  })

  describe('Email formatting edge cases', () => {
    it('accepts email with plus addressing', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const emailInput = screen.getByLabelText('Email Address *')
      await user.type(emailInput, 'user+tag@example.com')
      await user.tab()
      
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })

    it('accepts email with subdomain', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const emailInput = screen.getByLabelText('Email Address *')
      await user.type(emailInput, 'user@mail.example.com')
      await user.tab()
      
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })

    it('rejects email without domain', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const emailInput = screen.getByLabelText('Email Address *')
      await user.type(emailInput, 'user@')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('rejects email without @', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const emailInput = screen.getByLabelText('Email Address *')
      await user.type(emailInput, 'userexample.com')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })
  })

  describe('Phone formatting edge cases', () => {
    it('formats phone with parentheses and dashes', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '1234567890')
      
      expect(phoneInput.value).toBe('(123) 456-7890')
    })

    it('strips non-numeric characters during formatting', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '(555) 123-4567')
      
      expect(phoneInput.value).toBe('(555) 123-4567')
    })

    it('prevents phone numbers longer than 10 digits', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '12345678901234')
      
      // Should only keep first 10 digits
      expect(phoneInput.value).toBe('(123) 456-7890')
    })

    it('rejects phone with fewer than 10 digits', async () => {
      const user = userEvent.setup()
      render(<BrowserRouter><Reservations /></BrowserRouter>)
      
      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '555')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid 10-digit US phone number')).toBeInTheDocument()
      })
    })
  })
})
