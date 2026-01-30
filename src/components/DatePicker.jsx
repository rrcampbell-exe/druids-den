import { useState, useEffect } from 'react'
import './DatePicker.scss'

const DatePicker = ({ 
  checkInValue,
  checkOutValue,
  onCheckInChange,
  onCheckOutChange,
  label, 
  required, 
  blackoutDates = [],
  onRangeError,
  loading = false,
  loadingMessage = 'Loading availability...'
}) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingCheckOut, setSelectingCheckOut] = useState(false)
  const [rangeError, setRangeError] = useState('')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const currentYear = new Date().getFullYear()
  
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const parseDate = (dateString) => {
    if (!dateString) return null
    const [year, month, day] = dateString.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  const hasBlackoutDatesInRange = (startDate, endDate) => {
    const current = new Date(startDate)
    const end = new Date(endDate)
    const blackedOutDates = []
    
    // Check each date in the range (exclusive of check-in and check-out dates)
    current.setDate(current.getDate() + 1)
    while (current < end) {
      const dateString = formatDate(current)
      if (blackoutDates.includes(dateString)) {
        blackedOutDates.push(dateString)
      }
      current.setDate(current.getDate() + 1)
    }
    
    return blackedOutDates
  }
  
  const isDateDisabled = (date) => {
    const dateString = formatDate(date)
    const dateYear = date.getFullYear()
    
    // When selecting check-in: disable today and past dates
    if (!selectingCheckOut && date <= today) return true
    
    // When selecting check-out: enforce 2-night minimum from check-in
    if (selectingCheckOut && checkInValue) {
      const checkInDate = parseDate(checkInValue)
      if (checkInDate) {
        const minCheckOut = new Date(checkInDate)
        minCheckOut.setDate(minCheckOut.getDate() + 2)
        if (date < minCheckOut) return true
      }
    }
    
    // Disable if in the past
    if (date < today) return true
    
    // Disable if outside current year
    if (dateYear !== currentYear) return true
    
    // Disable if in blackout list
    if (blackoutDates.includes(dateString)) return true
    
    return false
  }
  
  const isDateInRange = (date) => {
    if (!checkInValue || !checkOutValue) return false
    
    const checkIn = parseDate(checkInValue)
    const checkOut = parseDate(checkOutValue)
    
    if (!checkIn || !checkOut) return false
    
    return date > checkIn && date < checkOut
  }
  
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
  
  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      const dateString = formatDate(date)
      
      if (!selectingCheckOut) {
        // First click: set check-in date
        onCheckInChange({ target: { name: 'checkIn', value: dateString } })
        // Clear check-out if it exists and is invalid with new check-in
        if (checkOutValue) {
          const checkOut = parseDate(checkOutValue)
          const minCheckOut = new Date(date)
          minCheckOut.setDate(minCheckOut.getDate() + 2)
          if (checkOut < minCheckOut) {
            onCheckOutChange({ target: { name: 'checkOut', value: '' } })
          }
        }
        setRangeError('')
        setSelectingCheckOut(true)
      } else {
        // Second click: set check-out date
        // Check for blackout dates in the range
        const checkInDate = parseDate(checkInValue)
        const blackedOutInRange = hasBlackoutDatesInRange(checkInDate, date)
        
        if (blackedOutInRange.length > 0) {
          const errorMsg = `Your selected dates conflict with other reservations. Please select a different date range.`
          setRangeError(errorMsg)
          if (onRangeError) {
            onRangeError(errorMsg)
          }
          return
        }
        
        setRangeError('')
        onCheckOutChange({ target: { name: 'checkOut', value: dateString } })
        setShowCalendar(false)
        setSelectingCheckOut(false)
      }
    }
  }
  
  const handleOpenCalendar = () => {
    setShowCalendar(!showCalendar)
    setSelectingCheckOut(false)
  }
  
  const handleClearDates = () => {
    onCheckInChange({ target: { name: 'checkIn', value: '' } })
    onCheckOutChange({ target: { name: 'checkOut', value: '' } })
    setSelectingCheckOut(false)
    setRangeError('')
  }
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const getDisplayValue = () => {
    if (checkInValue && checkOutValue) {
      const checkIn = parseDate(checkInValue)
      const checkOut = parseDate(checkOutValue)
      return `${checkIn?.toLocaleDateString()} - ${checkOut?.toLocaleDateString()}`
    } else if (checkInValue) {
      return `${parseDate(checkInValue)?.toLocaleDateString()} - Select check-out`
    }
    return ''
  }
  
  const isPrevMonthDisabled = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    return prevMonth.getFullYear() < currentYear || 
           (prevMonth.getFullYear() === currentYear && prevMonth.getMonth() < today.getMonth())
  }
  
  const isNextMonthDisabled = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    return nextMonth.getFullYear() > currentYear
  }
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCalendar && !e.target.closest('.date-picker')) {
        setShowCalendar(false)
        setSelectingCheckOut(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCalendar])
  
  return (
    <div className={`date-picker date-range-picker ${loading ? 'loading' : ''}`}>
      <label>{label} {required && '*'}</label>
      <div className='date-input-wrapper'>
        <input
          type='text'
          value={loading ? loadingMessage : getDisplayValue()}
          onClick={loading ? undefined : handleOpenCalendar}
          readOnly
          placeholder={loading ? loadingMessage : 'Select check-in and check-out dates'}
          required={required}
          disabled={loading}
        />
        {(checkInValue || checkOutValue) && !loading && (
          <button 
            type='button' 
            className='clear-btn'
            onClick={handleClearDates}
            aria-label='Clear dates'
          >
            ✕
          </button>
        )}
        <button 
          type='button' 
          className='calendar-icon-btn'
          onClick={loading ? undefined : handleOpenCalendar}
          aria-label='Open calendar'
          disabled={loading}
        >
          📅
        </button>
      </div>
      
      {rangeError && (
        <div className='date-range-error'>
          {rangeError}
        </div>
      )}
      
      {showCalendar && (
        <div className='calendar-dropdown'>
          <div className='calendar-header'>
            <button 
              type='button' 
              onClick={handlePrevMonth}
              disabled={isPrevMonthDisabled()}
              aria-label='Previous month'
            >
              ◀
            </button>
            <span className='month-year'>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              type='button' 
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled()}
              aria-label='Next month'
            >
              ▶
            </button>
          </div>
          
          <div className='calendar-grid'>
            {dayNames.map(day => (
              <div key={day} className='day-name'>{day}</div>
            ))}
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className='calendar-day empty' />
              }
              
              const dateString = formatDate(date)
              const isDisabled = isDateDisabled(date)
              const isCheckInDate = checkInValue && dateString === checkInValue
              const isCheckOutDate = checkOutValue && dateString === checkOutValue
              const inRange = isDateInRange(date)
              const isToday = formatDate(date) === formatDate(today)
              
              return (
                <button
                  key={index}
                  type='button'
                  className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isCheckInDate ? 'check-in' : ''} ${isCheckOutDate ? 'check-out' : ''} ${inRange ? 'in-range' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          
          <div className='calendar-legend'>
            <div className='legend-note'>
              {!selectingCheckOut 
                ? 'Select your check-in date' 
                : 'Select your check-out date - 2-night minimum stay'}
            </div>
            <span className='legend-item'><span className='legend-disabled'>■</span> Unavailable</span>
            <span className='legend-item'><span className='legend-available'>■</span> Available</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
