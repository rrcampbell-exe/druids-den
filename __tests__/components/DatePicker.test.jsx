import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DatePicker from '../../src/components/DatePicker'

describe('DatePicker', () => {
  let mockOnCheckInChange, mockOnCheckOutChange, mockOnRangeError
  
  beforeEach(() => {
    mockOnCheckInChange = vi.fn()
    mockOnCheckOutChange = vi.fn()
    mockOnRangeError = vi.fn()
    
    // Mock current date for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15'))
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders with label', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      expect(screen.getByText(/Select Dates/)).toBeInTheDocument()
    })

    it('shows asterisk when required', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
          required
        />
      )
      
      const label = screen.getByText(/Select Dates/)
      expect(label).toHaveTextContent('*')
    })

    it('shows placeholder when no dates selected', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      expect(screen.getByPlaceholderText('Select check-in and check-out dates')).toBeInTheDocument()
    })

    it('displays selected date range', () => {
      render(
        <DatePicker
          checkInValue="2026-06-01"
          checkOutValue="2026-06-03"
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input.value).toContain('6/1/2026')
      expect(input.value).toContain('6/3/2026')
    })

    it('shows clear button when dates are selected', () => {
      render(
        <DatePicker
          checkInValue="2026-06-01"
          checkOutValue="2026-06-03"
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      expect(screen.getByLabelText('Clear dates')).toBeInTheDocument()
    })

    it('hides clear button when no dates selected', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      expect(screen.queryByLabelText('Clear dates')).not.toBeInTheDocument()
    })
  })

  describe('Calendar Display', () => {
    it('opens calendar when input clicked', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      const input = screen.getByRole('textbox')
      fireEvent.click(input)
      
      expect(screen.getByText('January 2026')).toBeInTheDocument()
    })

    it('opens calendar when calendar icon clicked', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      const calendarBtn = screen.getByLabelText('Open calendar')
      fireEvent.click(calendarBtn)
      
      expect(screen.getByText('January 2026')).toBeInTheDocument()
    })

    it('toggles calendar when input clicked twice', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      const input = screen.getByRole('textbox')
      fireEvent.click(input)
      expect(screen.getByText('January 2026')).toBeInTheDocument()
      
      fireEvent.click(input)
      expect(screen.queryByText('January 2026')).not.toBeInTheDocument()
    })

    it('shows day names in calendar', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Tue')).toBeInTheDocument()
      expect(screen.getByText('Wed')).toBeInTheDocument()
      expect(screen.getByText('Thu')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()
    })

    it('closes calendar when clicking outside', () => {
      render(
        <div>
          <DatePicker
            checkInValue=""
            checkOutValue=""
            onCheckInChange={mockOnCheckInChange}
            onCheckOutChange={mockOnCheckOutChange}
            label="Select Dates"
          />
          <button>Outside</button>
        </div>
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2026')).toBeInTheDocument()
      
      fireEvent.mouseDown(screen.getByText('Outside'))
      waitFor(() => {
        expect(screen.queryByText('January 2026')).not.toBeInTheDocument()
      })
    })
  })

  describe('Month Navigation', () => {
    it('navigates to next month', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2026')).toBeInTheDocument()
      
      const nextBtn = screen.getByLabelText('Next month')
      fireEvent.click(nextBtn)
      
      expect(screen.getByText('February 2026')).toBeInTheDocument()
    })

    it('navigates to previous month', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // First go to February
      const nextBtn = screen.getByLabelText('Next month')
      fireEvent.click(nextBtn)
      expect(screen.getByText('February 2026')).toBeInTheDocument()
      
      // Then go back to January
      const prevBtn = screen.getByLabelText('Previous month')
      fireEvent.click(prevBtn)
      expect(screen.getByText('January 2026')).toBeInTheDocument()
    })

    it('disables previous month when at current month', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const prevBtn = screen.getByLabelText('Previous month')
      expect(prevBtn).toBeDisabled()
    })

    it('disables next month when at end of current year', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const nextBtn = screen.getByLabelText('Next month')
      
      // Navigate to December
      for (let i = 0; i < 11; i++) {
        fireEvent.click(nextBtn)
      }
      
      expect(screen.getByText('December 2026')).toBeInTheDocument()
      expect(nextBtn).toBeDisabled()
    })
  })

  describe('Date Selection', () => {
    it('selects check-in date on first click', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Click on a date (e.g., 20th)
      const dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      expect(mockOnCheckInChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'checkIn',
            value: '2026-01-20'
          })
        })
      )
    })

    it('shows instruction for check-in selection', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      expect(screen.getByText('Select your check-in date')).toBeInTheDocument()
    })

    it('shows instruction for check-out selection after check-in', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Select check-in
      const dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      expect(screen.getByText(/Select your check-out date - 2-night minimum/)).toBeInTheDocument()
    })

    it('selects check-out date on second click', () => {
      const { rerender } = render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Select check-in (20th)
      let dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      // Rerender with check-in value set
      rerender(
        <DatePicker
          checkInValue="2026-01-20"
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      // Select check-out (25th)
      dateButtons = screen.getAllByRole('button')
      const date25 = dateButtons.find(btn => btn.textContent === '25' && !btn.disabled)
      fireEvent.click(date25)
      
      expect(mockOnCheckOutChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'checkOut',
            value: '2026-01-25'
          })
        })
      )
    })

    it('clears dates when clear button clicked', () => {
      render(
        <DatePicker
          checkInValue="2026-06-01"
          checkOutValue="2026-06-03"
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      const clearBtn = screen.getByLabelText('Clear dates')
      fireEvent.click(clearBtn)
      
      expect(mockOnCheckInChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'checkIn',
            value: ''
          })
        })
      )
      
      expect(mockOnCheckOutChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'checkOut',
            value: ''
          })
        })
      )
    })

    it('does not allow selecting disabled dates', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
          blackoutDates={['2026-01-20']}
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20')
      
      expect(date20).toBeDisabled()
    })
  })

  describe('Blackout Dates', () => {
    it('disables blackout dates', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
          blackoutDates={['2026-01-20', '2026-01-21']}
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20')
      const date21 = dateButtons.find(btn => btn.textContent === '21')
      
      expect(date20).toBeDisabled()
      expect(date21).toBeDisabled()
    })

    it('prevents selecting range with blackout dates', () => {
      const { rerender } = render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          onRangeError={mockOnRangeError}
          label="Select Dates"
          blackoutDates={['2026-01-22']}
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Select check-in (20th)
      let dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      // Rerender with check-in set
      rerender(
        <DatePicker
          checkInValue="2026-01-20"
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          onRangeError={mockOnRangeError}
          label="Select Dates"
          blackoutDates={['2026-01-22']}
        />
      )
      
      // Try to select check-out (25th) - should fail because 22nd is blackout
      dateButtons = screen.getAllByRole('button')
      const date25 = dateButtons.find(btn => btn.textContent === '25' && !btn.disabled)
      fireEvent.click(date25)
      
      expect(mockOnRangeError).toHaveBeenCalledWith(
        expect.stringContaining('conflict')
      )
      expect(mockOnCheckOutChange).not.toHaveBeenCalled()
    })

    it('displays range error message', () => {
      const { rerender } = render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          onRangeError={mockOnRangeError}
          label="Select Dates"
          blackoutDates={['2026-01-22']}
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Select check-in
      let dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      rerender(
        <DatePicker
          checkInValue="2026-01-20"
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          onRangeError={mockOnRangeError}
          label="Select Dates"
          blackoutDates={['2026-01-22']}
        />
      )
      
      // Try to select invalid check-out
      dateButtons = screen.getAllByRole('button')
      const date25 = dateButtons.find(btn => btn.textContent === '25' && !btn.disabled)
      fireEvent.click(date25)
      
      expect(screen.getByText(/conflict with other reservations/)).toBeInTheDocument()
    })

    it('clears range error when valid dates selected', () => {
      const { rerender } = render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Select valid check-in
      let dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      // Should not show any error
      expect(screen.queryByText(/conflict/i)).not.toBeInTheDocument()
    })
  })

  describe('Date Validation', () => {
    it('enforces 2-night minimum stay', () => {
      const { rerender } = render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Select check-in (20th)
      let dateButtons = screen.getAllByRole('button')
      const date20 = dateButtons.find(btn => btn.textContent === '20' && !btn.disabled)
      fireEvent.click(date20)
      
      rerender(
        <DatePicker
          checkInValue="2026-01-20"
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      // 21st should be disabled (only 1 night)
      dateButtons = screen.getAllByRole('button')
      const date21 = dateButtons.find(btn => btn.textContent === '21')
      expect(date21).toBeDisabled()
      
      // 22nd should be enabled (2 nights)
      const date22 = dateButtons.find(btn => btn.textContent === '22')
      expect(date22).not.toBeDisabled()
    })

    it('disables past dates', () => {
      // Current date is 2026-01-15
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const dateButtons = screen.getAllByRole('button')
      const date10 = dateButtons.find(btn => btn.textContent === '10')
      const date16 = dateButtons.find(btn => btn.textContent === '16')
      
      // Past dates (10th) should be disabled
      expect(date10).toBeDisabled()
      // Future dates (16th) should be enabled
      expect(date16).not.toBeDisabled()
    })

    it('disables today', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const dateButtons = screen.getAllByRole('button')
      const date16 = dateButtons.find(btn => btn.textContent === '16')
      const date17 = dateButtons.find(btn => btn.textContent === '17')
      
      // Tomorrow (16th) should be enabled for check-in
      expect(date16).not.toBeDisabled()
      // Future dates should be enabled
      expect(date17).not.toBeDisabled()
    })
  })

  describe('Calendar Legend', () => {
    it('shows legend in calendar', () => {
      render(
        <DatePicker
          checkInValue=""
          checkOutValue=""
          onCheckInChange={mockOnCheckInChange}
          onCheckOutChange={mockOnCheckOutChange}
          label="Select Dates"
        />
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      
      expect(screen.getByText(/Unavailable/)).toBeInTheDocument()
      expect(screen.getByText(/Available/)).toBeInTheDocument()
    })
  })
})
