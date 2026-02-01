import { useState, useEffect } from 'react'
import ReservationCard from './ReservationCard'
import { reservationCache } from '../../utils/reservationCache'
import './AtAGlance.scss'

// Export helper functions for testing
export const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingDayOfWeek = new Date(year, month, 1).getDay()
  
  const days = []
  
  // Add empty slots for days before the month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }
  
  return days
}

export const formatDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getReservationsForDate = (date, reservations) => {
  if (!date) return []
  
  return reservations.filter(res => {
    // Exclude denied and cancelled reservations from calendar
    if (res.status === 'denied' || res.status === 'cancelled') return false
    
    // Parse dates as local dates to avoid timezone issues
    const [checkInYear, checkInMonth, checkInDay] = res.checkIn.split('-').map(Number)
    const [checkOutYear, checkOutMonth, checkOutDay] = res.checkOut.split('-').map(Number)
    
    const checkIn = new Date(checkInYear, checkInMonth - 1, checkInDay)
    const checkOut = new Date(checkOutYear, checkOutMonth - 1, checkOutDay)
    const current = new Date(date)
    
    // Set all times to midnight for accurate comparison
    checkIn.setHours(0, 0, 0, 0)
    checkOut.setHours(0, 0, 0, 0)
    current.setHours(0, 0, 0, 0)
    
    return current >= checkIn && current < checkOut
  })
}

export const getDayClass = (date, reservations, selectedCheckIn = null, selectedCheckOut = null) => {
  if (!date) return 'empty'
  
  const reservationsOnDate = getReservationsForDate(date, reservations)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDate = new Date(date)
  currentDate.setHours(0, 0, 0, 0)
  
  let classes = ['calendar-day']
  
  if (currentDate.getTime() === today.getTime()) {
    classes.push('today')
  }
  
  // Check if this date is the selected check-in or check-out during owner reservation flow
  if (selectedCheckIn) {
    const checkInDate = new Date(selectedCheckIn)
    checkInDate.setHours(0, 0, 0, 0)
    if (currentDate.getTime() === checkInDate.getTime()) {
      classes.push('selected-check-in')
    }
  }
  
  if (selectedCheckOut) {
    const checkOutDate = new Date(selectedCheckOut)
    checkOutDate.setHours(0, 0, 0, 0)
    if (currentDate.getTime() === checkOutDate.getTime()) {
      classes.push('selected-check-out')
    }
  }
  
  // Check if date is in the range between selected check-in and check-out
  if (selectedCheckIn && selectedCheckOut) {
    const checkIn = new Date(selectedCheckIn)
    const checkOut = new Date(selectedCheckOut)
    checkIn.setHours(0, 0, 0, 0)
    checkOut.setHours(0, 0, 0, 0)
    if (currentDate > checkIn && currentDate < checkOut) {
      classes.push('in-selection-range')
    }
  }
  
  // Check if any reservations are pending
  const hasPending = reservationsOnDate.some(res => res.status === 'pending')
  if (hasPending) {
    classes.push('has-pending')
  }
  
  // Check if any reservations are approved
  const hasApproved = reservationsOnDate.some(res => res.status === 'approved')
  const hasOwnerReservation = reservationsOnDate.some(res => res.isOwnerReservation)
  
  if (hasOwnerReservation && !hasPending) {
    classes.push('has-owner')
  } else if (hasApproved && !hasPending) {
    classes.push('has-approved')
  }
  
  // Check if it's a check-in or check-out day
  // Filter out denied and cancelled reservations
  const dateString = formatDateString(date)
  const activeReservations = reservations.filter(res => 
    res.status !== 'denied' && res.status !== 'cancelled'
  )
  const isCheckIn = activeReservations.some(res => res.checkIn === dateString)
  const isCheckOut = activeReservations.some(res => res.checkOut === dateString)
  
  if (isCheckIn) classes.push('check-in-day')
  if (isCheckOut) classes.push('check-out-day')
  
  return classes.join(' ')
}

export const getPendingReservations = (reservations) => {
  return reservations.filter(res => res.status === 'pending')
}

export const getUpcomingReservations = (reservations, filter = 'all') => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let filtered = reservations
    .filter(res => {
      const checkIn = new Date(res.checkIn)
      checkIn.setHours(0, 0, 0, 0)
      return res.status === 'approved' && checkIn >= today
    })
  
  if (filter === 'owner') {
    filtered = filtered.filter(res => res.isOwnerReservation)
  } else if (filter === 'guest') {
    filtered = filtered.filter(res => !res.isOwnerReservation)
  }
  
  return filtered.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
}

const AtAGlance = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [reservationView, setReservationView] = useState('pending') // 'pending' or 'upcoming'
  const [upcomingFilter, setUpcomingFilter] = useState('all') // 'all', 'owner', 'guest'
  
  // Notification state
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })
  
  // Loading states for async operations
  const [actionLoading, setActionLoading] = useState(false)
  
  // Owner reservation creation states
  const [isSelectingDates, setIsSelectingDates] = useState(false)
  const [selectedCheckIn, setSelectedCheckIn] = useState(null)
  const [selectedCheckOut, setSelectedCheckOut] = useState(null)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [ownerNote, setOwnerNote] = useState('')

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' })
    }, 4000)
  }

  useEffect(() => {
    // Fetch reservations from database with caching
    setLoading(true)
    reservationCache.fetch()
      .then(data => {
        setReservations(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading reservations:', err)
        setLoading(false)
      })
  }, [])

  // Update selectedReservation when reservations change
  useEffect(() => {
    if (selectedReservation && showModal) {
      const updatedReservation = reservations.find(r => r.id === selectedReservation.id)
      if (updatedReservation) {
        setSelectedReservation(updatedReservation)
      }
    }
  }, [reservations, showModal])

  const handleDateClick = (date) => {
    if (!date) return
    
    // If in date selection mode, handle owner reservation date selection
    if (isSelectingDates) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const currentDate = new Date(date)
      currentDate.setHours(0, 0, 0, 0)
      
      // Don't allow past dates
      if (currentDate < today) return
      
      if (!selectedCheckIn) {
        // First click: selecting check-in date
        // Check if this date is occupied (someone is already staying this night)
        const reservationsOnDate = getReservationsForDate(date, reservations)
        if (reservationsOnDate.length > 0) {
          showNotification('error', 'This date is already occupied. Please select an available check-in date.')
          return
        }
        setSelectedCheckIn(date)
      } else if (!selectedCheckOut) {
        // Second click: selecting check-out date
        // Check-out dates don't need to be "unoccupied" since guest leaves in morning
        // Just validate it's after check-in
        if (date <= selectedCheckIn) {
          showNotification('error', 'Check-out must be after check-in date.')
          return
        }
        
        // Check minimum 2-night stay
        const diffTime = date - selectedCheckIn
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays < 2) {
          showNotification('error', 'Minimum 2-night stay required.')
          return
        }
        
        // Check for conflicts in range
        // We check from check-in date (inclusive) to check-out date (exclusive)
        // This allows same-day check-out/check-in since check-out dates are free
        const checkIn = new Date(selectedCheckIn)
        const checkOut = new Date(date)
        const current = new Date(checkIn)
        
        while (current < checkOut) {
          const reservationsOnDay = getReservationsForDate(current, reservations)
          if (reservationsOnDay.length > 0) {
            showNotification('error', 'Selected date range conflicts with existing reservations.')
            return
          }
          current.setDate(current.getDate() + 1)
        }
        
        setSelectedCheckOut(date)
        setShowOwnerModal(true)
      }
      return
    }
    
    // Normal mode: show reservation details
    const reservationsOnDate = getReservationsForDate(date, reservations)
    if (reservationsOnDate.length > 0) {
      setSelectedReservation(reservationsOnDate[0])
      setShowModal(true)
    }
  }

  const handleStartBlockingDates = () => {
    setIsSelectingDates(true)
    setSelectedCheckIn(null)
    setSelectedCheckOut(null)
  }

  const handleCancelBlockingDates = () => {
    setIsSelectingDates(false)
    setSelectedCheckIn(null)
    setSelectedCheckOut(null)
    setOwnerNote('')
  }

  const handleCreateOwnerReservation = async () => {
    if (!selectedCheckIn || !selectedCheckOut) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: formatDateString(selectedCheckIn),
          checkOut: formatDateString(selectedCheckOut),
          ownerNote: ownerNote || 'Owner blocked dates',
          ownerEmail: 'owner@druidsdenwi.com' // TODO: Replace with actual owner email from auth
        })
      })

      if (!response.ok) throw new Error('Failed to create owner reservation')
      
      const newReservation = await response.json()
      
      // Invalidate cache after mutation
      reservationCache.invalidate()
      
      // Update local state
      setReservations(prev => [...prev, newReservation])
      setShowOwnerModal(false)
      setIsSelectingDates(false)
      setSelectedCheckIn(null)
      setSelectedCheckOut(null)
      setOwnerNote('')
      
      showNotification('success', 'Owner reservation created successfully!')
    } catch (error) {
      console.error('Error creating owner reservation:', error)
      showNotification('error', 'Failed to create owner reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleJumpToToday = () => {
    setCurrentMonth(new Date())
  }

const handleApprove = async (reservationId) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'approved',
          statusChangedById: null // TODO: Replace with actual owner user ID from auth
        })
      })

      if (!response.ok) throw new Error('Failed to approve reservation')
      
      const updatedReservation = await response.json()
      // Invalidate cache after mutation
      reservationCache.invalidate()
      
      // Update local state
      setReservations(prev => prev.map(res =>
        res.id === reservationId ? updatedReservation : res
      ))
      
      setShowModal(false)
      showNotification('success', 'Reservation approved and guest notified via email!')
    } catch (error) {
      console.error('Error approving reservation:', error)
      showNotification('error', 'Failed to approve reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeny = async (reservationId, message) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'denied',
          denialMessage: message,
          statusChangedById: null // TODO: Replace with actual owner user ID from auth
        })
      })

      if (!response.ok) throw new Error('Failed to deny reservation')
      
      const updatedReservation = await response.json()
      
      // Invalidate cache after mutation
      reservationCache.invalidate()
      
      // Update local state
      setReservations(prev => prev.map(res =>
        res.id === reservationId ? updatedReservation : res
      ))
      
      setShowModal(false)
      showNotification('success', 'Reservation denied and guest notified via email.')
    } catch (error) {
      console.error('Error denying reservation:', error)
      showNotification('error', 'Failed to deny reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (reservationId, message) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellationMessage: message,
          statusChangedById: null // TODO: Replace with actual owner user ID from auth
        })
      })

      if (!response.ok) throw new Error('Failed to cancel reservation')
      
      const updatedReservation = await response.json()
      
      // Invalidate cache after mutation
      reservationCache.invalidate()
      
      // Update local state
      setReservations(prev => prev.map(res =>
        res.id === reservationId ? updatedReservation : res
      ))
      
      showNotification('success', message ? 'Reservation cancelled and guest notified via email.' : 'Owner reservation cancelled successfully.')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      showNotification('error', 'Failed to cancel reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMessage = (reservationId, message) => {
    // In real implementation, this would call an API to send email
    console.log('Sending message to reservation:', reservationId, message)
    // TODO: Send custom email to guest
    alert('Message sent to guest!')
  }

  const handleEdit = async (reservationId, editData) => {
    setActionLoading(true)
    try {
      const updatePayload = {
        checkIn: editData.checkIn,
        checkOut: editData.checkOut,
        adults: editData.adults,
        children: editData.children
      }

      // Add special requests or owner note based on reservation type
      const reservation = reservations.find(r => r.id === reservationId)
      if (reservation?.isOwnerReservation) {
        updatePayload.ownerNote = editData.ownerNote
      } else {
        updatePayload.specialRequests = editData.specialRequests
      }

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error === 'Date conflict') {
          const conflictDates = errorData.conflicts.map(c => 
            `${c.checkIn} to ${c.checkOut}`
          ).join(', ')
          showNotification('error', `Cannot update: These dates conflict with existing reservations (${conflictDates}). Please choose different dates.`)
        } else {
          showNotification('error', errorData.message || 'Failed to update reservation')
        }
        return
      }
      
      const updatedReservation = await response.json()
      
      // Invalidate cache after mutation
      reservationCache.invalidate()
      
      // Update local state
      setReservations(prev => prev.map(res =>
        res.id === reservationId ? updatedReservation : res
      ))
      
      showNotification('success', 'Reservation updated successfully! Guest has been notified via email.')
    } catch (error) {
      console.error('Error updating reservation:', error)
      showNotification('error', 'Failed to update reservation. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const pendingReservations = getPendingReservations(reservations)
  const upcomingReservations = getUpcomingReservations(reservations, upcomingFilter)

  // Show loading skeleton
  if (loading) {
    return (
      <div className='at-a-glance'>
        <div className='calendar-section'>
          <div className='calendar-section-header'>
            <h2>Reservation Calendar</h2>
            <div className='header-buttons'>
              <div className='skeleton-button' style={{ width: '120px', height: '40px' }}></div>
              <div className='skeleton-button' style={{ width: '120px', height: '40px' }}></div>
            </div>
          </div>
          <div className='calendar-container'>
            <div className='calendar-header'>
              <div className='skeleton-text' style={{ width: '150px', height: '24px', margin: '0 auto' }}></div>
            </div>
            <div className='skeleton-calendar'>
              {[...Array(35)].map((_, i) => (
                <div key={i} className='skeleton-day'></div>
              ))}
            </div>
          </div>
        </div>
        <div className='reservations-section'>
          <div className='skeleton-text' style={{ width: '200px', height: '32px', marginBottom: '20px' }}></div>
          {[1, 2, 3].map(i => (
            <div key={i} className='skeleton-card'></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='at-a-glance'>
      <div className='calendar-section'>
        <div className='calendar-section-header'>
          <h2>Reservation Calendar</h2>
          <div className='header-buttons'>
            <button className='today-button' onClick={handleJumpToToday}>
              Jump to Today
            </button>
            {!isSelectingDates ? (
              <button className='block-dates-button' onClick={handleStartBlockingDates}>
                + Block Dates
              </button>
            ) : (
            <button className='cancel-button' onClick={handleCancelBlockingDates}>
              Cancel
            </button>
            )}
          </div>
        </div>
        
        {isSelectingDates && (
          <div className='selection-instructions'>
            <p>
              {!selectedCheckIn 
                ? '📅 Click a date to select check-in' 
                : !selectedCheckOut 
                  ? '📅 Click a date to select check-out'
                  : '✓ Dates selected'
              }
            </p>
          </div>
        )}
        
        <div className='calendar-container'>
          <div className='calendar-header'>
            <button onClick={handlePreviousMonth} className='nav-button'>
              ← Previous
            </button>
            <h3 className='month-year'>{monthYear}</h3>
            <button onClick={handleNextMonth} className='nav-button'>
              Next →
            </button>
          </div>

          <div className='calendar-grid'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className='day-name'>{day}</div>
            ))}
            
            {days.map((date, index) => (
              <div
                key={index}
                className={getDayClass(date, reservations, selectedCheckIn, selectedCheckOut)}
                onClick={() => date && handleDateClick(date)}
              >
                {date && (
                  <>
                    <span className='day-number'>{date.getDate()}</span>
                    {getReservationsForDate(date, reservations).length > 0 && (
                      <span className='reservation-indicator'>●</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className='calendar-legend'>
            <div className='legend-item'>
              <span className='legend-color pending'></span>
              <span>Pending Request</span>
            </div>
            <div className='legend-item'>
              <span className='legend-color approved'></span>
              <span>Guest Reservation</span>
            </div>
            <div className='legend-item'>
              <span className='legend-color owner'></span>
              <span>Owner Blocked</span>
            </div>
            <div className='legend-item'>
              <span className='legend-today'></span>
              <span>Today</span>
            </div>
            <div className='legend-item'>
              <span className='legend-check-in'></span>
              <span>Check-in Day</span>
            </div>
            <div className='legend-item'>
              <span className='legend-check-out'></span>
              <span>Check-out Day</span>
            </div>
          </div>
        </div>
      </div>

      <div className='reservations-section'>
        <div className='reservations-header'>
          <div className='reservations-tabs'>
            <button
              className={`reservation-tab ${reservationView === 'pending' ? 'active' : ''}`}
              onClick={() => setReservationView('pending')}
            >
              Pending Requests ({pendingReservations.length})
            </button>
            <button
              className={`reservation-tab ${reservationView === 'upcoming' ? 'active' : ''}`}
              onClick={() => setReservationView('upcoming')}
            >
              Upcoming Reservations ({upcomingReservations.length})
            </button>
          </div>
          
          {reservationView === 'upcoming' && (
            <div className='reservation-filters'>
              <button
                className={`filter-button ${upcomingFilter === 'all' ? 'active' : ''}`}
                onClick={() => setUpcomingFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-button ${upcomingFilter === 'guest' ? 'active' : ''}`}
                onClick={() => setUpcomingFilter('guest')}
              >
                Guest Only
              </button>
              <button
                className={`filter-button ${upcomingFilter === 'owner' ? 'active' : ''}`}
                onClick={() => setUpcomingFilter('owner')}
              >
                Owner Only
              </button>
            </div>
          )}
        </div>

        {reservationView === 'pending' && (
          <div className='reservation-view'>
            {pendingReservations.length === 0 ? (
              <p className='no-reservations'>No pending reservation requests</p>
            ) : (
              <div className='reservation-list'>
                {pendingReservations.map(reservation => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onMessage={handleMessage}
                    onEdit={handleEdit}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {reservationView === 'upcoming' && (
          <div className='reservation-view'>
            {upcomingReservations.length === 0 ? (
              <p className='no-reservations'>No upcoming reservations</p>
            ) : (
              <div className='reservation-list'>
                {upcomingReservations.map(reservation => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancel}
                    onMessage={handleMessage}
                    onEdit={handleEdit}
                    loading={actionLoading}
                    isApproved={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedReservation && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={() => setShowModal(false)}>×</button>
            <ReservationCard
              reservation={selectedReservation}
              onApprove={handleApprove}
              onDeny={handleDeny}
              onCancel={handleCancel}
              onMessage={handleMessage}
              onEdit={handleEdit}
              loading={actionLoading}
              isApproved={selectedReservation?.status === 'approved'}
              expanded={true}
            />
          </div>
        </div>
      )}
      
      {showOwnerModal && (
        <div className='modal-overlay' onClick={() => setShowOwnerModal(false)}>
          <div className='modal-content owner-reservation-modal' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={() => setShowOwnerModal(false)}>×</button>
            <h2>Block Dates for Owners</h2>
            
            <div className='date-summary'>
              <p><strong>Check-in:</strong> {selectedCheckIn?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p><strong>Check-out:</strong> {selectedCheckOut?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p><strong>Nights:</strong> {selectedCheckIn && selectedCheckOut && Math.ceil((selectedCheckOut - selectedCheckIn) / (1000 * 60 * 60 * 24))}</p>
            </div>
            
            <div className='form-field'>
              <label htmlFor='owner-note'>Owner's Note (optional):</label>
              <textarea
                id='owner-note'
                value={ownerNote}
                onChange={(e) => setOwnerNote(e.target.value)}
                placeholder='e.g., Personal visit, Maintenance, Friends and family...'
                rows={4}
              />
            </div>
            
            <div className='modal-actions'>
              <button 
                className='confirm-button' 
                onClick={handleCreateOwnerReservation}
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating...' : 'Reserve for Owners'}
              </button>
              <button 
                className='cancel-button' 
                onClick={() => setShowOwnerModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className='notification-close' 
            onClick={() => setNotification({ show: false, type: '', message: '' })}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default AtAGlance
