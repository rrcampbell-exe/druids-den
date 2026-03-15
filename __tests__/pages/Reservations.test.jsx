import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'

// Use vi.hoisted so the mockUser object has a stable reference across renders.
// Without this, useUser() returns a new object on every render, which causes
// useEffect([user]) in Reservations.jsx to fire infinitely.
const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    firstName: 'Test',
    lastName: 'User',
    primaryEmailAddress: { emailAddress: 'owner@example.com' },
    primaryPhoneNumber: null,
  },
}))

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ getToken: async () => 'mock-token' }),
  useUser: () => ({ user: mockUser }),
}))

vi.mock('../../src/utils/authHeaders', () => ({
  buildAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
}))

vi.mock('../../src/components', () => ({
  Coelbren: ({ children, renderAs: Tag = 'div', ...props }) => <Tag {...props}>{children}</Tag>,
  Flower: () => <div>Flower</div>,
  Leaf: () => <div>Leaf</div>,
  Awen: () => <span>Awen</span>,
  PageNav: () => <nav>PageNav</nav>,
  DatePicker: ({ label, checkInValue, checkOutValue, onCheckInChange, onCheckOutChange }) => (
    <div>
      <label htmlFor='checkIn'>{label} Check In</label>
      <input id='checkIn' name='checkIn' value={checkInValue} onChange={onCheckInChange} />
      <label htmlFor='checkOut'>{label} Check Out</label>
      <input id='checkOut' name='checkOut' value={checkOutValue} onChange={onCheckOutChange} />
    </div>
  ),
  Modal: ({ isOpen, title, children }) => (isOpen ? <div><h2>{title}</h2>{children}</div> : null),
  AuthHeader: () => <div>Signed in as</div>,
}))

import Reservations from '../../src/pages/Reservations'

const renderReservations = async () => {
  render(
    <BrowserRouter>
      <Reservations />
    </BrowserRouter>,
  )

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/availability')
  })
}

// Convenience: set both date fields via fireEvent (controlled inputs)
const setDates = (checkIn, checkOut) => {
  fireEvent.change(screen.getByLabelText('Dates of Reservation Check In'), {
    target: { name: 'checkIn', value: checkIn },
  })
  fireEvent.change(screen.getByLabelText('Dates of Reservation Check Out'), {
    target: { name: 'checkOut', value: checkOut },
  })
}

describe('Reservations', () => {
  let fetchSpy

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
    fetchSpy = vi.spyOn(global, 'fetch')
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        reservations: [
          {
            checkIn: '2026-06-10',
            checkOut: '2026-06-12',
          },
        ],
      }),
    })
  })

  afterEach(() => {
    fetchSpy.mockClear()
    vi.restoreAllMocks()
  })

  it('renders the reservation form for signed-in guests', async () => {
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/availability')
    })

    expect(screen.getByText('Reservations')).toBeInTheDocument()
    expect(screen.getByText('Your Northwoods Retreat Awaits')).toBeInTheDocument()
    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument()
  })

  it('loads public availability on mount', async () => {
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/availability')
    })
  })

  it('handles availability fetch error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchSpy.mockReset()
    fetchSpy.mockRejectedValue(new Error('Network error'))

    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading reservations:', expect.any(Error))
    })
  })

  it('prefills the authenticated email and keeps it read-only', async () => {
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const emailInput = await screen.findByLabelText('Email Address *')
    expect(emailInput).toHaveValue('owner@example.com')
    expect(emailInput).toHaveAttribute('readonly')
  })

  it('shows the linked-account note for the email field', async () => {
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/availability'))

    expect(
      screen.getByText('Your reservation will be linked to this approved account email.'),
    ).toBeInTheDocument()
  })

  it('formats the phone number input', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const phoneInput = screen.getByLabelText('Phone Number *')
    await user.clear(phoneInput)
    await user.type(phoneInput, '5551234567')

    expect(phoneInput).toHaveValue('(555) 123-4567')
  })

  it('validates phone format on blur', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const phoneInput = screen.getByLabelText('Phone Number *')
    await user.type(phoneInput, '123')
    await user.tab()

    expect(screen.getByText('Please enter a valid 10-digit US phone number')).toBeInTheDocument()
  })

  it('accepts valid phone without showing an error', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const phoneInput = screen.getByLabelText('Phone Number *')
    await user.type(phoneInput, '5551234567')
    await user.tab()

    expect(
      screen.queryByText('Please enter a valid 10-digit US phone number'),
    ).not.toBeInTheDocument()
  })

  it('updates first and last name on input', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const firstNameInput = screen.getByLabelText('First Name *')
    const lastNameInput = screen.getByLabelText('Last Name *')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'John')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, 'Doe')

    expect(firstNameInput).toHaveValue('John')
    expect(lastNameInput).toHaveValue('Doe')
  })

  it('updates adults and children count', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const adultsInput = screen.getByLabelText('Adults *')
    const childrenInput = screen.getByLabelText('Children')
    await user.clear(adultsInput)
    await user.type(adultsInput, '2')
    await user.clear(childrenInput)
    await user.type(childrenInput, '1')

    expect(adultsInput).toHaveValue(2)
    expect(childrenInput).toHaveValue(1)
  })

  it('updates special requests textarea', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const textarea = screen.getByLabelText(/Anything else we should know/)
    await user.type(textarea, 'Early check-in please')

    expect(textarea).toHaveValue('Early check-in please')
  })

  it('prevents submission when required fields are missing', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    await user.clear(screen.getByLabelText('First Name *'))
    await user.clear(screen.getByLabelText('Last Name *'))
    await user.clear(screen.getByLabelText('Phone Number *'))
    await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })

    expect(fetchSpy).not.toHaveBeenCalledWith('/api/send-reservation', expect.anything())
  })

  it('prevents submission with an invalid phone number', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Reservations />
      </BrowserRouter>,
    )

    const phoneInput = screen.getByLabelText('Phone Number *')
    await user.clear(phoneInput)
    await user.type(phoneInput, '123')
    await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit US phone number')).toBeInTheDocument()
    })

    expect(fetchSpy).not.toHaveBeenCalledWith('/api/send-reservation', expect.anything())
  })

  it('renders page sections', async () => {
    await renderReservations()

    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map((h) => h.textContent)
    expect(headingTexts).toContain('Your Information')
    expect(headingTexts).toContain('Reservation Details')
    expect(headingTexts).toContain('Additional Notes')
  })

  it('includes disclaimer text', async () => {
    await renderReservations()

    expect(screen.getByText(/By submitting this form/)).toBeInTheDocument()
  })

  it('renders the date picker component', async () => {
    await renderReservations()

    expect(screen.getByText('Dates of Reservation Check In')).toBeInTheDocument()
  })

  describe('Form submission', () => {
    // Helper: mock fetch to route submission calls separately from availability
    const mockSubmitFetch = (submitResponse) => {
      fetchSpy.mockImplementation((url) => {
        if (url === '/api/send-reservation') {
          return Promise.resolve(submitResponse)
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ reservations: [] }),
        })
      })
    }

    it('does not POST when required fields are empty', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/availability'))
      await user.clear(screen.getByLabelText('First Name *'))
      await user.clear(screen.getByLabelText('Last Name *'))

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      expect(fetchSpy).not.toHaveBeenCalledWith('/api/send-reservation', expect.anything())
    })

    it('POSTs to /api/send-reservation with a fully valid form', async () => {
      const user = userEvent.setup()
      mockSubmitFetch({
        ok: true,
        json: async () => ({ success: true, reservationId: 'res-123' }),
      })

      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/availability'))
      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      setDates('2026-07-15', '2026-07-20')

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('/api/send-reservation', expect.any(Object))
      })
    })

    it('shows success modal after successful submission', async () => {
      const user = userEvent.setup()
      mockSubmitFetch({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/availability'))
      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      setDates('2026-07-15', '2026-07-20')

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      await waitFor(() => {
        expect(screen.getByText('Reservation Request Received!')).toBeInTheDocument()
      })
    })

    it('shows error modal on server error', async () => {
      const user = userEvent.setup()
      mockSubmitFetch({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/availability'))
      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      setDates('2026-07-15', '2026-07-20')

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      await waitFor(() => {
        expect(screen.getByText('Unable to Complete Request')).toBeInTheDocument()
      })
    })

    it('shows date conflict message on 409 response', async () => {
      const user = userEvent.setup()
      mockSubmitFetch({
        ok: false,
        status: 409,
        json: async () => ({ message: 'These dates are no longer available.' }),
      })

      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/availability'))
      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      setDates('2026-07-15', '2026-07-20')

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      await waitFor(() => {
        expect(screen.getByText('These dates are no longer available.')).toBeInTheDocument()
      })
    })
  })

  describe('Guest count validation', () => {
    it('limits adults to a maximum of 6', async () => {
      await renderReservations()

      expect(screen.getByLabelText('Adults *')).toHaveAttribute('max', '6')
    })

    it('requires at least one adult', async () => {
      await renderReservations()

      expect(screen.getByLabelText('Adults *')).toHaveAttribute('min', '1')
    })

    it('allows zero children', async () => {
      await renderReservations()

      expect(screen.getByLabelText('Children')).toHaveAttribute('min', '0')
    })

    it('prevents submission when total guests exceed 10', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      // 6 adults + 5 children = 11
      await user.clear(screen.getByLabelText('Adults *'))
      await user.type(screen.getByLabelText('Adults *'), '6')
      await user.clear(screen.getByLabelText('Children'))
      await user.type(screen.getByLabelText('Children'), '5')

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      await waitFor(() => {
        expect(screen.getByText('Maximum 10 guests total allowed')).toBeInTheDocument()
      })

      // Only the initial availability fetch — no POST
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('does not show guest limit error with exactly 10 guests', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

      await user.type(screen.getByLabelText('Phone Number *'), '5551234567')
      // 6 adults + 4 children = 10
      await user.clear(screen.getByLabelText('Adults *'))
      await user.type(screen.getByLabelText('Adults *'), '6')
      await user.clear(screen.getByLabelText('Children'))
      await user.type(screen.getByLabelText('Children'), '4')

      await user.click(screen.getByRole('button', { name: /submit reservation request/i }))

      await waitFor(() => {
        expect(screen.queryByText('Maximum 10 guests total allowed')).not.toBeInTheDocument()
      })
    })
  })

  describe('Special requests', () => {
    it('accepts text input for special requests', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      const textarea = screen.getByLabelText(/Anything else we should know/)
      await user.type(textarea, 'Please provide extra pillows')

      expect(textarea).toHaveValue('Please provide extra pillows')
    })

    it('starts with an empty special requests field', async () => {
      await renderReservations()

      expect(screen.getByLabelText(/Anything else we should know/)).toHaveValue('')
    })
  })

  describe('Phone formatting edge cases', () => {
    it('formats phone with parentheses and dashes', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '1234567890')

      expect(phoneInput).toHaveValue('(123) 456-7890')
    })

    it('strips non-numeric characters during formatting', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '(555) 123-4567')

      expect(phoneInput).toHaveValue('(555) 123-4567')
    })

    it('prevents phone numbers longer than 10 digits', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '12345678901234')

      expect(phoneInput).toHaveValue('(123) 456-7890')
    })

    it('rejects phone with fewer than 10 digits on blur', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '555')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid 10-digit US phone number'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Form validation edge cases', () => {
    it('clears phone validation error when the field is corrected', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalled())

      const phoneInput = screen.getByLabelText('Phone Number *')
      await user.type(phoneInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid 10-digit US phone number'),
        ).toBeInTheDocument()
      })

      await user.clear(phoneInput)
      await user.type(phoneInput, '5551234567')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a valid 10-digit US phone number'),
        ).not.toBeInTheDocument()
      })
    })

    it('maintains form state when navigating between fields', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalled())

      const firstNameInput = screen.getByLabelText('First Name *')
      const phoneInput = screen.getByLabelText('Phone Number *')

      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')
      await user.click(phoneInput)
      await user.type(phoneInput, '5559876543')
      await user.click(firstNameInput)

      expect(firstNameInput).toHaveValue('Jane')
      expect(phoneInput).toHaveValue('(555) 987-6543')
    })

    it('handles an empty reservations array gracefully', async () => {
      fetchSpy.mockClear()
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reservations: [] }),
      })

      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => {
        expect(screen.getByText('Reservations')).toBeInTheDocument()
      })
    })

    it('handles a malformed availability response gracefully', async () => {
      fetchSpy.mockClear()
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // no reservations key
      })

      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => {
        expect(screen.getByText('Reservations')).toBeInTheDocument()
      })
    })

    it('accepts input across all user-editable form fields', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <Reservations />
        </BrowserRouter>,
      )

      await waitFor(() => expect(fetchSpy).toHaveBeenCalled())

      const firstNameInput = screen.getByLabelText('First Name *')
      const lastNameInput = screen.getByLabelText('Last Name *')
      const phoneInput = screen.getByLabelText('Phone Number *')
      const specialRequestsInput = screen.getByLabelText('Anything else we should know? (Optional)')

      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')
      await user.clear(lastNameInput)
      await user.type(lastNameInput, 'Smith')
      await user.clear(phoneInput)
      await user.type(phoneInput, '5559876543')
      await user.type(specialRequestsInput, 'Celebrating anniversary')

      expect(firstNameInput).toHaveValue('Jane')
      expect(lastNameInput).toHaveValue('Smith')
      expect(phoneInput).toHaveValue('(555) 987-6543')
      expect(specialRequestsInput).toHaveValue('Celebrating anniversary')
    })
  })
})
