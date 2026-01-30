import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AtAGlance, { getDaysInMonth, formatDateString, getReservationsForDate, getDayClass, getPendingReservations, getUpcomingReservations } from '../../../src/pages/dashboard/AtAGlance'

// Mock the reservation cache utility
vi.mock('../../../src/utils/reservationCache', () => ({
  reservationCache: {
    fetch: vi.fn(),
    invalidate: vi.fn()
  }
}))

// Mock ReservationCard
vi.mock('../../../src/pages/dashboard/ReservationCard', () => ({
  default: ({ reservation, onApprove, onDeny, onCancel, onMessage }) => (
    <div data-testid={`reservation-card-${reservation.id}`}>
      <span>{reservation.firstName} {reservation.lastName}</span>
      <button onClick={() => onApprove(reservation.id)}>Approve</button>
      <button onClick={() => onDeny(reservation.id, 'test')}>Deny</button>
      <button onClick={() => onCancel(reservation.id, 'test')}>Cancel</button>
      <button onClick={() => onMessage(reservation.id, 'test')}>Message</button>
    </div>
  )
}))

// Mock fetch
global.fetch = vi.fn()

const mockReservations = {
  reservations: [
    {
      id: 'res-001',
      status: 'pending',
      firstName: 'John',
      lastName: 'Doe',
      checkIn: '2026-02-15',
      checkOut: '2026-02-17',
      adults: 2,
      children: 0
    },
    {
      id: 'res-002',
      status: 'approved',
      firstName: 'Jane',
      lastName: 'Smith',
      checkIn: '2026-03-01',
      checkOut: '2026-03-03',
      adults: 2,
      children: 1
    },
    {
      id: 'res-003',
      status: 'approved',
      isOwnerReservation: true,
      checkIn: '2026-03-10',
      checkOut: '2026-03-12'
    }
  ]
}

// Import the mock after setting it up
import { reservationCache } from '../../../src/utils/reservationCache'

describe('AtAGlance', () => {
  beforeEach(() => {
    // Mock the current date to January 29, 2026 for consistent test results
    vi.setSystemTime(new Date('2026-01-29T12:00:00.000Z'))
    
    vi.clearAllMocks()
    fetch.mockResolvedValue({
      json: async () => mockReservations
    })
    
    // Mock cache.fetch to return mockReservations
    reservationCache.fetch.mockResolvedValue(mockReservations.reservations)
  })

  afterEach(() => {
    // Clean up date mocking after each test
    vi.useRealTimers()
  })

  it('renders without crashing', async () => {
    render(<AtAGlance />)
    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })
  })

  it('loads reservations on mount', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(reservationCache.fetch).toHaveBeenCalled()
    })
  })

  it('displays calendar with current month', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })
  })

  it('shows previous and next month buttons', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      const prevButton = screen.getByText('← Previous')
      const nextButton = screen.getByText('Next →')
      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })
  })

  it('navigates to next month when next button clicked', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })
    
    const nextButton = screen.getByText('Next →')
    fireEvent.click(nextButton)
    
    expect(screen.getByText(/February 2026/)).toBeInTheDocument()
  })

  it('navigates to previous month when prev button clicked', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })
    
    const prevButton = screen.getByText('← Previous')
    fireEvent.click(prevButton)
    
    expect(screen.getByText(/December 2025/)).toBeInTheDocument()
  })

  it('jumps to current month when Today button clicked', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText(/January 2026/)).toBeInTheDocument()
    })
    
    // Navigate away
    const nextButton = screen.getByText('Next →')
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    
    expect(screen.getByText(/March 2026/)).toBeInTheDocument()
    
    // Jump back to today
    const todayButton = screen.getByText('Jump to Today')
    fireEvent.click(todayButton)
    
    expect(screen.getByText(/January 2026/)).toBeInTheDocument()
  })

  it('shows pending and upcoming tabs', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText(/Pending Requests/)).toBeInTheDocument()
      expect(screen.getByText(/Upcoming Reservations/)).toBeInTheDocument()
    })
  })

  it('switches between pending and upcoming tabs', async () => {
    render(<AtAGlance />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Pending Requests/)).toBeInTheDocument()
    })
    
    const upcomingTab = screen.getByText(/Upcoming Reservations/)
    fireEvent.click(upcomingTab)
    
    // Should show upcoming reservations
    await waitFor(() => {
      expect(screen.getByTestId('reservation-card-res-002')).toBeInTheDocument()
    })
  })

  it('shows filter buttons (All, Guest, Owner)', async () => {
    render(<AtAGlance />)
    
    // First switch to Upcoming tab where filters appear
    await waitFor(() => {
      const upcomingTab = screen.getByText(/Upcoming Reservations/)
      fireEvent.click(upcomingTab)
    })
    
    // Now filters should be visible
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Guest Only')).toBeInTheDocument()
      expect(screen.getByText('Owner Only')).toBeInTheDocument()
    })
  })

  it('filters reservations by type', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      const upcomingTab = screen.getByText(/Upcoming Reservations/)
      fireEvent.click(upcomingTab)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('reservation-card-res-002')).toBeInTheDocument()
    })
    
    // Filter to owner only
    const ownerFilter = screen.getByText('Owner Only')
    fireEvent.click(ownerFilter)
    
    expect(screen.queryByTestId('reservation-card-res-002')).not.toBeInTheDocument()
    expect(screen.getByTestId('reservation-card-res-003')).toBeInTheDocument()
  })

  it('displays reservation count', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      // Check that tabs show counts - "(1)" and "(2)" in this case
      expect(screen.getByText(/Pending Requests \(1\)/)).toBeInTheDocument()
      expect(screen.getByText(/Upcoming Reservations \(2\)/)).toBeInTheDocument()
    })
  })

  it('shows Block Dates button', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText('+ Block Dates')).toBeInTheDocument()
    })
  })

  it('opens owner reservation modal when button clicked', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      const addButton = screen.getByText('+ Block Dates')
      fireEvent.click(addButton)
    })
    
    // After clicking, the interface changes to date selection mode
    expect(screen.getByText(/Click a date to select check-in/)).toBeInTheDocument()
    // Check for cancel button with specific class
    const cancelButton = document.querySelector('.cancel-button')
    expect(cancelButton).toBeInTheDocument()
  })

  it('renders approve button for pending reservations', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Approve').length).toBeGreaterThan(0)
    })
  })

  it('renders deny button for pending reservations', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Deny').length).toBeGreaterThan(0)
    })
  })

  it('renders calendar grid with day headers', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Tue')).toBeInTheDocument()
      expect(screen.getByText('Wed')).toBeInTheDocument()
      expect(screen.getByText('Thu')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()
    })
  })

  it('shows today indicator on current date', async () => {
    render(<AtAGlance />)
    
    await waitFor(() => {
      const today = new Date().getDate()
      const todayCell = screen.getByText(today.toString()).closest('.calendar-day')
      expect(todayCell).toHaveClass('today')
    })
  })

  it('displays no reservations message when list is empty', async () => {
    reservationCache.fetch.mockResolvedValueOnce([])
    
    render(<AtAGlance />)
    
    await waitFor(() => {
      expect(screen.getByText(/No pending reservation requests/)).toBeInTheDocument()
    })
  })

  describe('Calendar date interactions', () => {
    it('highlights reservation dates on calendar', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        // mockReservations have dates in February, need to navigate there
        const nextButton = screen.getByText('Next →')
        fireEvent.click(nextButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/February 2026/)).toBeInTheDocument()
      })
    })

    it('shows different date for previous month', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        expect(screen.getByText(/January 2026/)).toBeInTheDocument()
      })
      
      const prevButton = screen.getByText('← Previous')
      fireEvent.click(prevButton)
      
      await waitFor(() => {
        expect(screen.getByText(/December 2025/)).toBeInTheDocument()
      })
    })

    it('displays current month name correctly', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        const monthDisplay = screen.getByText(/January 2026/)
        expect(monthDisplay).toBeInTheDocument()
      })
    })
  })

  describe('Reservation list management', () => {
    it('shows correct count in tab labels', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        expect(screen.getByText(/Pending Requests \(1\)/)).toBeInTheDocument()
        expect(screen.getByText(/Upcoming Reservations \(2\)/)).toBeInTheDocument()
      })
    })

    it('updates when switching tabs', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        const upcomingTab = screen.getByText(/Upcoming Reservations/)
        fireEvent.click(upcomingTab)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('reservation-card-res-002')).toBeInTheDocument()
      })
    })

    it('applies filters correctly', async () => {
      render(<AtAGlance />)
      
      // Switch to upcoming tab first
      await waitFor(() => {
        const upcomingTab = screen.getByText(/Upcoming Reservations/)
        fireEvent.click(upcomingTab)
      })
      
      // Apply owner filter
      await waitFor(() => {
        const ownerFilter = screen.getByText('Owner Only')
        fireEvent.click(ownerFilter)
      })
      
      // Only owner reservation should be visible
      expect(screen.getByTestId('reservation-card-res-003')).toBeInTheDocument()
      expect(screen.queryByTestId('reservation-card-res-002')).not.toBeInTheDocument()
    })

    it('resets filter when switching back to All', async () => {
      render(<AtAGlance />)
      
      // Switch to upcoming and apply filter
      await waitFor(() => {
        fireEvent.click(screen.getByText(/Upcoming Reservations/))
      })
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Owner Only'))
      })
      
      // Switch back to All
      await waitFor(() => {
        fireEvent.click(screen.getByText('All'))
      })
      
      // Both reservations should be visible
      await waitFor(() => {
        expect(screen.getByTestId('reservation-card-res-002')).toBeInTheDocument()
        expect(screen.getByTestId('reservation-card-res-003')).toBeInTheDocument()
      })
    })
  })

  describe('Owner reservation modal', () => {
    it('opens modal when Block Dates clicked', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        const blockButton = screen.getByText('+ Block Dates')
        fireEvent.click(blockButton)
      })
      
      expect(screen.getByText(/Click a date to select check-in/)).toBeInTheDocument()
    })

    it('closes modal when cancel clicked', async () => {
      render(<AtAGlance />)
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('+ Block Dates'))
      })
      
      await waitFor(() => {
        const cancelButton = document.querySelector('.cancel-button')
        fireEvent.click(cancelButton)
      })
      
      expect(screen.queryByText(/Click a date to select check-in/)).not.toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('handles fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      reservationCache.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(<AtAGlance />)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })
      
      consoleSpy.mockRestore()
    })

    it('handles empty response data', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({})
      })
      
      render(<AtAGlance />)
      
      await waitFor(() => {
        expect(screen.getByText(/Pending Requests/)).toBeInTheDocument()
      })
    })
  })

  describe('Helper Functions', () => {
    describe('getDaysInMonth', () => {
      it('returns correct number of days for January 2026', () => {
        const date = new Date(2026, 0, 1) // January 2026
        const days = getDaysInMonth(date)
        
        // January 2026 starts on Thursday (day 4), has 31 days
        // Should have 4 null values + 31 days = 35 elements
        expect(days.length).toBe(35)
        expect(days.filter(d => d === null).length).toBe(4)
      })

      it('returns correct number of days for February 2026', () => {
        const date = new Date(2026, 1, 1) // February 2026
        const days = getDaysInMonth(date)
        
        // February 2026 has 28 days, starts on Sunday
        expect(days.length).toBe(28)
        expect(days[0]).not.toBeNull()
      })

      it('handles leap year correctly', () => {
        const date = new Date(2024, 1, 1) // February 2024 (leap year)
        const days = getDaysInMonth(date)
        
        const nonNullDays = days.filter(d => d !== null)
        expect(nonNullDays.length).toBe(29) // Leap year has 29 days
      })
    })

    describe('formatDateString', () => {
      it('formats date correctly', () => {
        const date = new Date(2026, 0, 15) // January 15, 2026
        expect(formatDateString(date)).toBe('2026-01-15')
      })

      it('pads single digit month and day', () => {
        const date = new Date(2026, 4, 5) // May 5, 2026
        expect(formatDateString(date)).toBe('2026-05-05')
      })

      it('handles December correctly', () => {
        const date = new Date(2026, 11, 25) // December 25, 2026
        expect(formatDateString(date)).toBe('2026-12-25')
      })
    })

    describe('getReservationsForDate', () => {
      const mockReservations = [
        { id: '1', checkIn: '2026-06-10', checkOut: '2026-06-15', status: 'approved' },
        { id: '2', checkIn: '2026-06-12', checkOut: '2026-06-14', status: 'pending' },
        { id: '3', checkIn: '2026-06-20', checkOut: '2026-06-25', status: 'denied' },
        { id: '4', checkIn: '2026-06-20', checkOut: '2026-06-25', status: 'cancelled' }
      ]

      it('returns reservations for a specific date', () => {
        const date = new Date(2026, 5, 12) // June 12, 2026
        const result = getReservationsForDate(date, mockReservations)
        
        expect(result.length).toBe(2) // Both reservations 1 and 2 overlap
        expect(result.map(r => r.id)).toContain('1')
        expect(result.map(r => r.id)).toContain('2')
      })

      it('excludes denied and cancelled reservations', () => {
        const date = new Date(2026, 5, 22) // June 22, 2026
        const result = getReservationsForDate(date, mockReservations)
        
        expect(result.length).toBe(0) // Denied and cancelled are excluded
      })

      it('returns empty array for null date', () => {
        const result = getReservationsForDate(null, mockReservations)
        expect(result).toEqual([])
      })

      it('does not include checkout day', () => {
        const date = new Date(2026, 5, 15) // June 15 (checkout day for reservation 1)
        const result = getReservationsForDate(date, mockReservations)
        
        expect(result.map(r => r.id)).not.toContain('1')
      })
    })

    describe('getDayClass', () => {
      const mockReservations = [
        { id: '1', checkIn: '2026-06-10', checkOut: '2026-06-15', status: 'approved', isOwnerReservation: false },
        { id: '2', checkIn: '2026-06-12', checkOut: '2026-06-14', status: 'pending', isOwnerReservation: false },
        { id: '3', checkIn: '2026-06-20', checkOut: '2026-06-25', status: 'approved', isOwnerReservation: true }
      ]

      it('returns empty for null date', () => {
        expect(getDayClass(null, mockReservations)).toBe('empty')
      })

      it('includes today class for current date', () => {
        vi.setSystemTime(new Date(2026, 0, 29, 12, 0, 0))
        const today = new Date(2026, 0, 29)
        const classes = getDayClass(today, mockReservations)
        
        expect(classes).toContain('today')
        vi.useRealTimers()
      })

      it('includes has-pending class for pending reservations', () => {
        const date = new Date(2026, 5, 12) // June 12 - has pending
        const classes = getDayClass(date, mockReservations)
        
        expect(classes).toContain('has-pending')
      })

      it('includes has-approved class for approved guest reservations', () => {
        const date = new Date(2026, 5, 11) // June 11 - has approved, no pending
        const classes = getDayClass(date, mockReservations)
        
        expect(classes).toContain('has-approved')
      })

      it('includes has-owner class for owner reservations', () => {
        const date = new Date(2026, 5, 22) // June 22 - owner reservation
        const classes = getDayClass(date, mockReservations)
        
        expect(classes).toContain('has-owner')
      })

      it('includes check-in-day class', () => {
        const date = new Date(2026, 5, 10) // June 10 - check-in day
        const classes = getDayClass(date, mockReservations)
        
        expect(classes).toContain('check-in-day')
      })

      it('includes check-out-day class', () => {
        const date = new Date(2026, 5, 15) // June 15 - check-out day for reservation 1
        const classes = getDayClass(date, mockReservations)
        
        // Check-out day should have check-out-day class since the day is free
        // (guest checks out in the morning)
        expect(classes).toContain('check-out-day')
        expect(classes).not.toContain('has-approved')
      })
    })

    describe('getPendingReservations', () => {
      const mockReservations = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'approved' },
        { id: '3', status: 'pending' },
        { id: '4', status: 'denied' }
      ]

      it('returns only pending reservations', () => {
        const result = getPendingReservations(mockReservations)
        
        expect(result.length).toBe(2)
        expect(result.every(r => r.status === 'pending')).toBe(true)
      })

      it('returns empty array when no pending reservations', () => {
        const noPending = mockReservations.filter(r => r.status !== 'pending')
        const result = getPendingReservations(noPending)
        
        expect(result).toEqual([])
      })
    })

    describe('getUpcomingReservations', () => {
      // Set a fixed date for testing
      beforeEach(() => {
        vi.setSystemTime(new Date(2026, 0, 29, 12, 0, 0)) // January 29, 2026
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      const mockReservations = [
        { id: '1', checkIn: '2026-02-10', status: 'approved', isOwnerReservation: false },
        { id: '2', checkIn: '2026-03-15', status: 'approved', isOwnerReservation: true },
        { id: '3', checkIn: '2026-01-20', status: 'approved', isOwnerReservation: false }, // Past
        { id: '4', checkIn: '2026-02-05', status: 'pending', isOwnerReservation: false } // Pending
      ]

      it('returns only future approved reservations', () => {
        const result = getUpcomingReservations(mockReservations, 'all')
        
        expect(result.length).toBe(2)
        expect(result.every(r => r.status === 'approved')).toBe(true)
        expect(result.map(r => r.id)).not.toContain('3') // Past
        expect(result.map(r => r.id)).not.toContain('4') // Pending
      })

      it('sorts reservations by check-in date', () => {
        const result = getUpcomingReservations(mockReservations, 'all')
        
        expect(result[0].id).toBe('1') // February
        expect(result[1].id).toBe('2') // March
      })

      it('filters by owner reservations', () => {
        const result = getUpcomingReservations(mockReservations, 'owner')
        
        expect(result.length).toBe(1)
        expect(result[0].isOwnerReservation).toBe(true)
      })

      it('filters by guest reservations', () => {
        const result = getUpcomingReservations(mockReservations, 'guest')
        
        expect(result.length).toBe(1)
        expect(result[0].isOwnerReservation).toBe(false)
      })
    })
  })
})
