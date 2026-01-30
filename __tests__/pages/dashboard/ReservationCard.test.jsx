import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReservationCard, { formatDate, formatDateTime, calculateNights } from '../../../src/pages/dashboard/ReservationCard'

describe('ReservationCard', () => {
  const mockPendingReservation = {
    id: 'res-001',
    status: 'pending',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    checkIn: '2026-03-01',
    checkOut: '2026-03-03',
    adults: 2,
    children: 0,
    specialRequests: 'Early check-in please',
    estimatedTotal: 350
  }

  const mockApprovedReservation = {
    ...mockPendingReservation,
    status: 'approved',
    approvedAt: '2026-02-01T10:00:00Z'
  }

  const mockOwnerReservation = {
    id: 'res-002',
    status: 'approved',
    isOwnerReservation: true,
    checkIn: '2026-03-10',
    checkOut: '2026-03-12',
    ownerNote: 'Spring maintenance'
  }

  const mockHandlers = {
    onApprove: vi.fn(),
    onDeny: vi.fn(),
    onCancel: vi.fn(),
    onMessage: vi.fn(),
    onEdit: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders pending reservation correctly', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('555-1234')).toBeInTheDocument()
    expect(screen.getByText('2 adults')).toBeInTheDocument()
  })

  it('shows action buttons for pending reservation', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    expect(screen.getByText('✓ Approve Reservation')).toBeInTheDocument()
    expect(screen.getByText('✗ Deny Request')).toBeInTheDocument()
    expect(screen.getByText('💬 Message Guest')).toBeInTheDocument()
  })

  it('shows cancel button for approved reservation', () => {
    render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
    
    expect(screen.getByText('Cancel Reservation')).toBeInTheDocument()
    expect(screen.getByText('💬 Message Guest')).toBeInTheDocument()
  })

  it('calls onApprove when approve button clicked', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const approveButton = screen.getByText('✓ Approve Reservation')
    fireEvent.click(approveButton)
    
    expect(mockHandlers.onApprove).toHaveBeenCalledWith(mockPendingReservation.id)
  })

  it('shows deny form when deny button clicked', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const denyButton = screen.getByText('✗ Deny Request')
    fireEvent.click(denyButton)
    
    expect(screen.getByPlaceholderText(/Let the guest know why their request cannot be accommodated/)).toBeInTheDocument()
    expect(screen.getByText('Send Denial')).toBeInTheDocument()
  })

  it('validates deny message is required', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const denyButton = screen.getByText('✗ Deny Request')
    fireEvent.click(denyButton)
    
    const sendButton = screen.getByText('Send Denial')
    fireEvent.click(sendButton)
    
    // Should still be in form state (not called handler)
    expect(mockHandlers.onDeny).not.toHaveBeenCalled()
  })

  it('calls onDeny with message when denial submitted', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const denyButton = screen.getByText('✗ Deny Request')
    fireEvent.click(denyButton)
    
    const textarea = screen.getByPlaceholderText(/Let the guest know why their request cannot be accommodated/)
    fireEvent.change(textarea, { target: { value: 'Sorry, dates unavailable' } })
    
    const sendButton = screen.getByText('Send Denial')
    fireEvent.click(sendButton)
    
    expect(mockHandlers.onDeny).toHaveBeenCalledWith(
      mockPendingReservation.id,
      'Sorry, dates unavailable'
    )
  })

  it('shows cancel form when cancel button clicked', () => {
    render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
    
    const cancelButton = screen.getByText('Cancel Reservation')
    fireEvent.click(cancelButton)
    
    expect(screen.getByPlaceholderText(/Let the guest know why their reservation is being cancelled/)).toBeInTheDocument()
  })

  it('shows message form when message button clicked', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const messageButton = screen.getByText('💬 Message Guest')
    fireEvent.click(messageButton)
    
    expect(screen.getByPlaceholderText(/Send a custom message to the guest/)).toBeInTheDocument()
    expect(screen.getByText('Send Message')).toBeInTheDocument()
  })

  it('calls onMessage when message submitted', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const messageButton = screen.getByText('💬 Message Guest')
    fireEvent.click(messageButton)
    
    const textarea = screen.getByPlaceholderText(/Send a custom message to the guest/)
    fireEvent.change(textarea, { target: { value: 'Looking forward to your visit!' } })
    
    const sendButton = screen.getByText('Send Message')
    fireEvent.click(sendButton)
    
    expect(mockHandlers.onMessage).toHaveBeenCalledWith(
      mockPendingReservation.id,
      'Looking forward to your visit!'
    )
  })

  it('renders owner reservation with different styling', () => {
    render(<ReservationCard reservation={mockOwnerReservation} {...mockHandlers} />)
    
    expect(screen.getByText('Owner Reservation')).toBeInTheDocument()
    expect(screen.getByText('Spring maintenance')).toBeInTheDocument()
  })

  it('does not show message button for owner reservations', () => {
    render(<ReservationCard reservation={mockOwnerReservation} {...mockHandlers} />)
    
    expect(screen.queryByText('Message Guest')).not.toBeInTheDocument()
  })

  it('displays special requests when provided', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    expect(screen.getByText('Early check-in please')).toBeInTheDocument()
  })

  it('displays estimated total for guest reservations', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    expect(screen.getByText(/\$350/)).toBeInTheDocument()
  })

  it('cancels form when cancel button clicked in form', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    const denyButton = screen.getByText('✗ Deny Request')
    fireEvent.click(denyButton)
    
    expect(screen.getByPlaceholderText(/Let the guest know why their request cannot be accommodated/)).toBeInTheDocument()
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(screen.queryByPlaceholderText(/Let the guest know why their request cannot be accommodated/)).not.toBeInTheDocument()
  })

  it('displays pending badge for pending reservations', () => {
    const { container } = render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    expect(container.querySelector('.status-badge.pending')).toBeInTheDocument()
  })

  it('displays approved badge for approved reservations', () => {
    const { container } = render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} />)
    expect(container.querySelector('.status-badge.approved')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    // Should show formatted dates (component uses 'March 1, 2026' format)
    expect(screen.getByText('March 1, 2026')).toBeInTheDocument()
    expect(screen.getByText('March 3, 2026')).toBeInTheDocument()
  })

  it('calculates nights correctly', () => {
    render(<ReservationCard reservation={mockPendingReservation} {...mockHandlers} />)
    
    expect(screen.getByText(/2 nights/)).toBeInTheDocument()
  })

  describe('Cancellation flow', () => {
    it('shows cancellation form when cancel button clicked for guest reservation', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      expect(screen.getByLabelText(/Message to guest \(required\):/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Let the guest know why their reservation is being cancelled/)).toBeInTheDocument()
      expect(screen.getByText('Send Cancellation')).toBeInTheDocument()
      expect(screen.getByText('Nevermind')).toBeInTheDocument()
    })

    it('validates cancellation message is required for guest reservations', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      const sendButton = screen.getByText('Send Cancellation')
      fireEvent.click(sendButton)
      
      expect(screen.getByText('Please provide a message for the guest')).toBeInTheDocument()
      expect(mockHandlers.onCancel).not.toHaveBeenCalled()
    })

    it('submits cancellation with message for guest reservation', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      const textarea = screen.getByPlaceholderText(/Let the guest know why their reservation is being cancelled/)
      fireEvent.change(textarea, { target: { value: 'Property needs emergency maintenance' } })
      
      const sendButton = screen.getByText('Send Cancellation')
      fireEvent.click(sendButton)
      
      expect(mockHandlers.onCancel).toHaveBeenCalledWith(mockApprovedReservation.id, 'Property needs emergency maintenance')
    })

    it('cancels cancellation form when Nevermind clicked', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      expect(screen.getByText('Send Cancellation')).toBeInTheDocument()
      
      const nevermindButton = screen.getByText('Nevermind')
      fireEvent.click(nevermindButton)
      
      expect(screen.queryByText('Send Cancellation')).not.toBeInTheDocument()
      expect(screen.getByText('Cancel Reservation')).toBeInTheDocument()
    })

    it('clears error when typing in cancellation message', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      // Trigger error
      const sendButton = screen.getByText('Send Cancellation')
      fireEvent.click(sendButton)
      expect(screen.getByText('Please provide a message for the guest')).toBeInTheDocument()
      
      // Type to clear error
      const textarea = screen.getByPlaceholderText(/Let the guest know why their reservation is being cancelled/)
      fireEvent.change(textarea, { target: { value: 'Reason' } })
      
      expect(screen.queryByText('Please provide a message for the guest')).not.toBeInTheDocument()
    })

    it('shows confirmation for owner reservation cancellation', () => {
      render(<ReservationCard reservation={mockOwnerReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      expect(screen.getByText('Are you sure you want to cancel this owner reservation?')).toBeInTheDocument()
      expect(screen.getByText('Confirm Cancellation')).toBeInTheDocument()
      expect(screen.queryByLabelText(/Message to guest/)).not.toBeInTheDocument()
    })

    it('submits owner reservation cancellation without message', () => {
      render(<ReservationCard reservation={mockOwnerReservation} {...mockHandlers} isApproved={true} />)
      
      const cancelButton = screen.getByText('Cancel Reservation')
      fireEvent.click(cancelButton)
      
      const confirmButton = screen.getByText('Confirm Cancellation')
      fireEvent.click(confirmButton)
      
      expect(mockHandlers.onCancel).toHaveBeenCalledWith(mockOwnerReservation.id, null)
    })
  })

  describe('Message form for approved reservations', () => {
    it('shows message form when Message Guest clicked on approved reservation', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const messageButton = screen.getByText('💬 Message Guest')
      fireEvent.click(messageButton)
      
      expect(screen.getByLabelText(/Message to guest:/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Send a custom message to the guest/)).toBeInTheDocument()
      expect(screen.getByText('Send Message')).toBeInTheDocument()
    })

    it('validates message content is required', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const messageButton = screen.getByText('💬 Message Guest')
      fireEvent.click(messageButton)
      
      const sendButton = screen.getByText('Send Message')
      fireEvent.click(sendButton)
      
      expect(screen.getByText('Please enter a message')).toBeInTheDocument()
      expect(mockHandlers.onMessage).not.toHaveBeenCalled()
    })

    it('submits message to approved guest', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const messageButton = screen.getByText('💬 Message Guest')
      fireEvent.click(messageButton)
      
      const textarea = screen.getByPlaceholderText(/Send a custom message to the guest/)
      fireEvent.change(textarea, { target: { value: 'We have your cabin ready!' } })
      
      const sendButton = screen.getByText('Send Message')
      fireEvent.click(sendButton)
      
      expect(mockHandlers.onMessage).toHaveBeenCalledWith(mockApprovedReservation.id, 'We have your cabin ready!')
    })

    it('clears error when typing in message field', () => {
      render(<ReservationCard reservation={mockApprovedReservation} {...mockHandlers} isApproved={true} />)
      
      const messageButton = screen.getByText('💬 Message Guest')
      fireEvent.click(messageButton)
      
      // Trigger error
      const sendButton = screen.getByText('Send Message')
      fireEvent.click(sendButton)
      expect(screen.getByText('Please enter a message')).toBeInTheDocument()
      
      // Type to clear error
      const textarea = screen.getByPlaceholderText(/Send a custom message to the guest/)
      fireEvent.change(textarea, { target: { value: 'Hi' } })
      
      expect(screen.queryByText('Please enter a message')).not.toBeInTheDocument()
    })
  })

  describe('Helper functions', () => {
    it('formatDate returns correct format', () => {
      expect(formatDate('2026-03-15')).toBe('March 15, 2026')
      expect(formatDate('2026-12-31')).toBe('December 31, 2026')
      expect(formatDate('2026-01-01')).toBe('January 1, 2026')
    })

    it('formatDateTime returns correct format', () => {
      const result = formatDateTime('2026-02-15T14:30:00Z')
      expect(result).toContain('Feb')
      expect(result).toContain('15')
    })

    it('calculateNights returns correct number of nights', () => {
      expect(calculateNights('2026-03-01', '2026-03-03')).toBe(2)
      expect(calculateNights('2026-06-15', '2026-06-20')).toBe(5)
      expect(calculateNights('2026-01-01', '2026-01-02')).toBe(1)
    })
  })

  describe('Edit functionality', () => {
    it('shows edit form when edit button clicked', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('validates check-in and check-out dates are required', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      const checkInInput = screen.getByLabelText(/Check-in:/)
      fireEvent.change(checkInInput, { target: { value: '' } })
      
      const updateButton = screen.getByText('Save Changes')
      fireEvent.click(updateButton)
      
      expect(screen.getByText('Check-in and check-out dates are required')).toBeInTheDocument()
    })

    it('validates check-out date must be after check-in', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      const checkInInput = screen.getByLabelText(/Check-in:/)
      const checkOutInput = screen.getByLabelText(/Check-out:/)
      
      fireEvent.change(checkInInput, { target: { value: '2026-06-10' } })
      fireEvent.change(checkOutInput, { target: { value: '2026-06-09' } })
      
      const updateButton = screen.getByText('Save Changes')
      fireEvent.click(updateButton)
      
      expect(screen.getByText('Check-out date must be after check-in date')).toBeInTheDocument()
    })

    it('validates at least 1 adult is required', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      const adultsInput = screen.getByLabelText(/Adults/)
      fireEvent.change(adultsInput, { target: { value: '0' } })
      
      const updateButton = screen.getByText('Save Changes')
      fireEvent.click(updateButton)
      
      expect(screen.getByText('At least 1 adult is required')).toBeInTheDocument()
    })

    it('validates maximum 10 guests allowed', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      const adultsInput = screen.getByLabelText(/Adults/)
      const childrenInput = screen.getByLabelText(/Children/)
      
      fireEvent.change(adultsInput, { target: { value: '6' } })
      fireEvent.change(childrenInput, { target: { value: '5' } })
      
      const updateButton = screen.getByText('Save Changes')
      fireEvent.click(updateButton)
      
      expect(screen.getByText('Maximum 10 guests allowed')).toBeInTheDocument()
    })

    it('calls onEdit when valid edit is submitted', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      const adultsInput = screen.getByLabelText(/Adults/)
      fireEvent.change(adultsInput, { target: { value: '3' } })
      
      const updateButton = screen.getByText('Save Changes')
      fireEvent.click(updateButton)
      
      expect(mockHandlers.onEdit).toHaveBeenCalled()
    })

    it('cancels edit form when Cancel clicked', () => {
      const editableReservation = { ...mockApprovedReservation }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument()
      expect(screen.getByText('✎ Edit Reservation')).toBeInTheDocument()
    })

    it('pre-fills edit form with current reservation data', () => {
      const editableReservation = { 
        ...mockApprovedReservation,
        specialRequests: 'Bring extra towels',
        ownerNote: 'VIP guest'
      }
      render(<ReservationCard reservation={editableReservation} {...mockHandlers} isApproved={true} />)
      
      const editButton = screen.getByText('✎ Edit Reservation')
      fireEvent.click(editButton)
      
      const adultsInput = screen.getByLabelText(/Adults/)
      expect(adultsInput.value).toBe('2')
    })
  })
})
