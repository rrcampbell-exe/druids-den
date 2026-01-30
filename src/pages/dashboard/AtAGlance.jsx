import { useState, useEffect } from 'react'
import ReservationCard from './ReservationCard'
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
  const dateString = formatDateString(date)
  const isCheckIn = reservationsOnDate.some(res => res.checkIn === dateString)
  const isCheckOut = reservationsOnDate.some(res => res.checkOut === dateString)
  
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
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [reservationView, setReservationView] = useState('pending') // 'pending' or 'upcoming'
  const [upcomingFilter, setUpcomingFilter] = useState('all') // 'all', 'owner', 'guest'
  
  // Owner reservation creation states
  const [isSelectingDates, setIsSelectingDates] = useState(false)
  const [selectedCheckIn, setSelectedCheckIn] = useState(null)
  const [selectedCheckOut, setSelectedCheckOut] = useState(null)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [ownerNote, setOwnerNote] = useState('')

  useEffect(() => {
    // Load mock reservations
    fetch('/mock-reservations.json')
      .then(response => response.json())
      .then(data => setReservations(data.reservations || []))
      .catch(err => console.error('Error loading reservations:', err))
  }, [])

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
          alert('This date is already occupied. Please select an available check-in date.')
          return
        }
        setSelectedCheckIn(date)
      } else if (!selectedCheckOut) {
        // Second click: selecting check-out date
        // Check-out dates don't need to be "unoccupied" since guest leaves in morning
        // Just validate it's after check-in
        if (date <= selectedCheckIn) {
          alert('Check-out must be after check-in date.')
          return
        }
        
        // Check minimum 2-night stay
        const diffTime = date - selectedCheckIn
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays < 2) {
          alert('Minimum 2-night stay required.')
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
            alert('Selected date range conflicts with existing reservations.')
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

  const handleCreateOwnerReservation = () => {
    if (!selectedCheckIn || !selectedCheckOut) return
    
    const newReservation = {
      id: `res-owner-${Date.now()}`,
      status: 'approved',
      isOwnerReservation: true,
      checkIn: formatDateString(selectedCheckIn),
      checkOut: formatDateString(selectedCheckOut),
      ownerNote: ownerNote || 'Owner blocked dates',
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    }
    
    setReservations(prev => [...prev, newReservation])
    setShowOwnerModal(false)
    setIsSelectingDates(false)
    setSelectedCheckIn(null)
    setSelectedCheckOut(null)
    setOwnerNote('')
    // TODO: API call to save to database
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

  const handleApprove = (reservationId) => {
    // In real implementation, this would call an API
    setReservations(prev => prev.map(res => 
      res.id === reservationId 
        ? { ...res, status: 'approved', approvedAt: new Date().toISOString() }
        : res
    ))
    setShowModal(false)
    // TODO: Send approval email to guest
  }

  const handleDeny = (reservationId, message) => {
    // In real implementation, this would call an API
    setReservations(prev => prev.map(res =>
      res.id === reservationId
        ? { ...res, status: 'denied', deniedAt: new Date().toISOString(), denialMessage: message }
        : res
    ))
    setShowModal(false)
    // TODO: Send denial email to guest with custom message
  }

  const handleCancel = (reservationId, message) => {
    // In real implementation, this would call an API
    setReservations(prev => prev.map(res =>
      res.id === reservationId
        ? { ...res, status: 'cancelled', cancelledAt: new Date().toISOString(), cancellationMessage: message }
        : res
    ))
    // TODO: Send cancellation email to guest if not owner reservation
  }

  const handleMessage = (reservationId, message) => {
    // In real implementation, this would call an API to send email
    console.log('Sending message to reservation:', reservationId, message)
    // TODO: Send custom email to guest
    alert('Message sent to guest!')
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const pendingReservations = getPendingReservations(reservations)
  const upcomingReservations = getUpcomingReservations(reservations, upcomingFilter)

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
              <button className='confirm-button' onClick={handleCreateOwnerReservation}>
                Reserve for Owners
              </button>
              <button className='cancel-button' onClick={() => setShowOwnerModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AtAGlance
