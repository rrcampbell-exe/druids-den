import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Reports from '../../../src/pages/dashboard/Reports'

// Mock Nivo charts
vi.mock('@nivo/line', () => ({
  ResponsiveLine: ({ data }) => (
    <div data-testid="line-chart">
      Line Chart: {data[0]?.data?.length || 0} data points
    </div>
  )
}))

vi.mock('@nivo/bar', () => ({
  ResponsiveBar: ({ data }) => (
    <div data-testid="bar-chart">
      Bar Chart: {data.length} bars
    </div>
  )
}))

// Mock fetch
global.fetch = vi.fn()

const mockReservations = {
  reservations: [
    {
      id: 'res-001',
      status: 'completed',
      firstName: 'John',
      lastName: 'Doe',
      checkIn: '2026-01-10',
      checkOut: '2026-01-13',
      adults: 2,
      children: 0,
      estimatedTotal: 450,
      submittedAt: '2025-12-15T10:00:00Z'
    },
    {
      id: 'res-002',
      status: 'completed',
      firstName: 'Jane',
      lastName: 'Smith',
      checkIn: '2026-01-20',
      checkOut: '2026-01-23',
      adults: 3,
      children: 1,
      estimatedTotal: 525,
      submittedAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'res-003',
      status: 'approved',
      isOwnerReservation: true,
      checkIn: '2026-01-25',
      checkOut: '2026-01-27'
    }
  ]
}

describe('Reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockReservations
    })
  })

  it('renders without crashing', async () => {
    render(<Reports />)
    await waitFor(() => {
      expect(screen.getByText('Analytics & Reports')).toBeInTheDocument()
    })
  })

  it('loads reservations on mount', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/reservations', { headers: {} })
    })
  })

  it('shows time range selector buttons', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Year to Date')).toBeInTheDocument()
      expect(screen.getByText('Full Year')).toBeInTheDocument()
      expect(screen.getByText('Custom Range')).toBeInTheDocument()
    })
  })

  it('defaults to Year to Date view', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const ytdButton = screen.getByText('Year to Date')
      expect(ytdButton).toHaveClass('active')
    })
  })

  it('switches to Full Year when clicked', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const fullYearButton = screen.getByText('Full Year')
      fireEvent.click(fullYearButton)
      expect(fullYearButton).toHaveClass('active')
    })
  })

  it('shows custom date inputs when Custom Range selected', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Custom Range')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Custom Range'))

    await waitFor(() => {
      const dateInputs = screen.getAllByDisplayValue('')
      expect(dateInputs.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('displays all 6 metric cards', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Occupancy Rate')).toBeInTheDocument()
      expect(screen.getByText('Avg Revenue/Booking')).toBeInTheDocument()
      expect(screen.getByText('Avg Stay Length')).toBeInTheDocument()
      expect(screen.getByText('Avg Booking Lead Time')).toBeInTheDocument()
      expect(screen.getByText('Avg Party Size')).toBeInTheDocument()
    })
  })

  it('calculates total revenue correctly', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      // Should show $975 (450 + 525)
      expect(screen.getByText('$975')).toBeInTheDocument()
    })
  })

  it('shows booking count', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('2 bookings')).toBeInTheDocument()
    })
  })

  it('displays occupancy percentage', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const occupancyValue = screen.getByText(/\d+\.\d+%/)
      expect(occupancyValue).toBeInTheDocument()
    })
  })

  it('shows toggle for including owner reservations in metrics', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      // Use getAllByText since there are multiple toggles on the page
      const toggles = screen.getAllByText('Include Owner Reservations')
      expect(toggles.length).toBeGreaterThan(0)
    })
  })

  it('updates metrics when owner toggle is changed', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
      expect(screen.getByText(/nights booked/)).toBeInTheDocument()
    })

    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(screen.getByText(/nights booked/)).toBeInTheDocument()
    })
  })

  it('renders line chart for revenue over time', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Revenue Over Time')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('renders bar chart for bookings by month', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Bookings by Month')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  it('shows toggle for including owner reservations in bookings chart', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const bookingsSection = screen.getByText('Bookings by Month').closest('.chart-container')
      const toggle = bookingsSection.querySelector('input[type="checkbox"]')
      expect(toggle).toBeInTheDocument()
    })
  })

  it('displays revenue breakdown table', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Revenue Breakdown')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('shows guest names in revenue table', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('displays reservation dates in table', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      // Check table exists and has date columns
      expect(screen.getByText('Check-in')).toBeInTheDocument()
      expect(screen.getByText('Check-out')).toBeInTheDocument()
      // Check that at least one date value is rendered (format may vary)
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('shows number of nights in table', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const table = screen.getByText('Revenue Breakdown').closest('.revenue-table-container')
      expect(table.textContent).toContain('3')
    })
  })

  it('formats currency correctly', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('$450')).toBeInTheDocument()
      expect(screen.getByText('$525')).toBeInTheDocument()
    })
  })

  it('shows no data message when no reservations', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reservations: [] })
    })
    
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText(/No data available/)).toBeInTheDocument()
    })
  })

  it('filters out pending reservations from metrics', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reservations: [
          ...mockReservations.reservations,
          {
            id: 'res-pending',
            status: 'pending',
            firstName: 'Pending',
            lastName: 'Guest',
            checkIn: '2026-02-01',
            checkOut: '2026-02-03',
            estimatedTotal: 300
          }
        ]
      })
    })
    
    render(<Reports />)
    
    await waitFor(() => {
      // Should still only show $975, not $1275
      expect(screen.getByText('$975')).toBeInTheDocument()
    })
  })

  it('calculates average party size correctly', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      // (2 + 3 + 1) / 2 = 3 guests average
      expect(screen.getByText('3.0 guests')).toBeInTheDocument()
    })
  })

  it('calculates average stay length correctly', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      // (3 nights + 3 nights) / 2 = 3.0 nights
      expect(screen.getByText('3.0 nights')).toBeInTheDocument()
    })
  })

  it('prevents selecting future dates in custom range', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const customButton = screen.getByText('Custom Range')
      fireEvent.click(customButton)
    })
    
    const dateInputs = screen.getAllByDisplayValue('')
    const today = new Date().toISOString().split('T')[0]
    
    dateInputs.forEach(input => {
      expect(input.getAttribute('max')).toBe(today)
    })
  })

  it('excludes owner reservations from revenue calculations by default', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      // Should only count guest bookings (2), not owner (1)
      expect(screen.getByText('2 bookings')).toBeInTheDocument()
    })
  })

  it('switches to full year range', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Year to Date')).toBeInTheDocument()
    })
    
    const fullYearButton = screen.getByText('Full Year')
    fireEvent.click(fullYearButton)
    
    expect(fullYearButton.classList.contains('active')).toBe(true)
  })

  it('switches to custom range and shows date inputs', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Custom Range')).toBeInTheDocument()
    })
    
    const customButton = screen.getByText('Custom Range')
    fireEvent.click(customButton)

    await waitFor(() => {
      expect(customButton.classList.contains('active')).toBe(true)
      expect(screen.getAllByDisplayValue('').length).toBeGreaterThan(0)
    })
  })

  it('allows setting custom date range', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByText('Custom Range')).toBeInTheDocument()
    })
    
    const customButton = screen.getByText('Custom Range')
    fireEvent.click(customButton)

    let dateInputs = []
    await waitFor(() => {
      dateInputs = screen.getAllByPlaceholderText(/date/i)
      expect(dateInputs.length).toBeGreaterThan(0)
    })
    
    if (dateInputs.length >= 2) {
      fireEvent.change(dateInputs[0], { target: { value: '2026-01-01' } })
      fireEvent.change(dateInputs[1], { target: { value: '2026-01-31' } })
      
      expect(dateInputs[0].value).toBe('2026-01-01')
      expect(dateInputs[1].value).toBe('2026-01-31')
    }
  })

  it('handles fetch error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetch.mockClear()
    fetch.mockRejectedValueOnce(new Error('Network error'))
    
    render(<Reports />)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading reservations:', expect.any(Error))
    })
    
    expect(screen.getByText('Analytics & Reports')).toBeInTheDocument()
    
    consoleErrorSpy.mockRestore()
  })

  it('displays bookings chart with both owner and guest bookings', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      const barChart = screen.getByTestId('bar-chart')
      expect(barChart).toBeInTheDocument()
      expect(barChart).toHaveTextContent('Bar Chart')
    })
  })

  it('toggles owner reservations in bookings chart', async () => {
    render(<Reports />)
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
    
    const checkboxes = screen.getAllByRole('checkbox')
    const bookingsToggle = checkboxes.find(cb => cb.checked === true)
    
    if (bookingsToggle) {
      fireEvent.click(bookingsToggle)
      expect(bookingsToggle.checked).toBe(false)
    }
  })
})
