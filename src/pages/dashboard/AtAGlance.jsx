import { useState, useEffect } from 'react'
import ReservationCard from './ReservationCard'
import './AtAGlance.scss'

const AtAGlance = () => {
  const [reservations, setReservations] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)

  useEffect(() => {
    // Load mock reservations
    fetch('/mock-reservations.json')
      .then(response => response.json())
      .then(data => setReservations(data.reservations))
      .catch(err => console.error('Error loading reservations:', err))
  }, [])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDateString = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getReservationsForDate = (date) => {
    if (!date) return []
    const dateString = formatDateString(date)
    
    return reservations.filter(res => {
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

  const getDayClass = (date) => {
    if (!date) return 'empty'
    
    const reservationsOnDate = getReservationsForDate(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentDate = new Date(date)
    currentDate.setHours(0, 0, 0, 0)
    
    let classes = ['calendar-day']
    
    if (currentDate.getTime() === today.getTime()) {
      classes.push('today')
    }
    
    // Check if any reservations are pending
    const hasPending = reservationsOnDate.some(res => res.status === 'pending')
    if (hasPending) {
      classes.push('has-pending')
    }
    
    // Check if any reservations are approved
    const hasApproved = reservationsOnDate.some(res => res.status === 'approved')
    if (hasApproved && !hasPending) {
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

  const handleDateClick = (date) => {
    if (!date) return
    const reservationsOnDate = getReservationsForDate(date)
    if (reservationsOnDate.length > 0) {
      setSelectedDate(date)
      setSelectedReservation(reservationsOnDate[0])
      setShowModal(true)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getPendingReservations = () => {
    return reservations.filter(res => res.status === 'pending')
  }

  const getUpcomingReservations = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return reservations
      .filter(res => {
        const checkIn = new Date(res.checkIn)
        checkIn.setHours(0, 0, 0, 0)
        return res.status === 'approved' && checkIn >= today
      })
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
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

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const pendingReservations = getPendingReservations()
  const upcomingReservations = getUpcomingReservations()

  return (
    <div className='at-a-glance'>
      <div className='calendar-section'>
        <h2>Reservation Calendar</h2>
        
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
                className={getDayClass(date)}
                onClick={() => handleDateClick(date)}
              >
                {date && (
                  <>
                    <span className='day-number'>{date.getDate()}</span>
                    {getReservationsForDate(date).length > 0 && (
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
              <span>Approved/Booked</span>
            </div>
            <div className='legend-item'>
              <span className='legend-today'></span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className='reservations-section'>
        <div className='pending-section'>
          <h2>Pending Requests ({pendingReservations.length})</h2>
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
                />
              ))}
            </div>
          )}
        </div>

        <div className='upcoming-section'>
          <h2>Upcoming Reservations ({upcomingReservations.length})</h2>
          {upcomingReservations.length === 0 ? (
            <p className='no-reservations'>No upcoming reservations</p>
          ) : (
            <div className='reservation-list'>
              {upcomingReservations.map(reservation => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  isApproved={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedReservation && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={() => setShowModal(false)}>×</button>
            <ReservationCard
              reservation={selectedReservation}
              onApprove={handleApprove}
              onDeny={handleDeny}
              expanded={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AtAGlance
