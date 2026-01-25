import { useState } from 'react'
import './ReservationCard.scss'

const ReservationCard = ({ reservation, onApprove, onDeny, isApproved = false, expanded = false }) => {
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [denialMessage, setDenialMessage] = useState('')
  const [denialError, setDenialError] = useState('')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    })
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const calculateNights = () => {
    const checkIn = new Date(reservation.checkIn)
    const checkOut = new Date(reservation.checkOut)
    const diffTime = Math.abs(checkOut - checkIn)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDenySubmit = () => {
    if (!denialMessage.trim()) {
      setDenialError('Please provide a message for the guest')
      return
    }
    onDeny(reservation.id, denialMessage)
    setShowDenyForm(false)
    setDenialMessage('')
    setDenialError('')
  }

  const handleDenyCancel = () => {
    setShowDenyForm(false)
    setDenialMessage('')
    setDenialError('')
  }

  const nights = calculateNights()

  return (
    <div className={`reservation-card ${reservation.status} ${expanded ? 'expanded' : ''}`}>
      <div className='card-header'>
        <div className='guest-info'>
          <h3>{reservation.firstName} {reservation.lastName}</h3>
          <span className={`status-badge ${reservation.status}`}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </span>
        </div>
        <div className='dates-info'>
          <div className='date-range'>
            <strong>{formatDate(reservation.checkIn)}</strong> → <strong>{formatDate(reservation.checkOut)}</strong>
          </div>
          <div className='nights-count'>{nights} {nights === 1 ? 'night' : 'nights'}</div>
        </div>
      </div>

      <div className='card-body'>
        <div className='info-grid'>
          <div className='info-item'>
            <span className='info-label'>Email:</span>
            <a href={`mailto:${reservation.email}`} className='info-value'>{reservation.email}</a>
          </div>
          <div className='info-item'>
            <span className='info-label'>Phone:</span>
            <span className='info-value'>{reservation.phone}</span>
          </div>
          <div className='info-item'>
            <span className='info-label'>Guests:</span>
            <span className='info-value'>
              {reservation.adults} {reservation.adults === 1 ? 'adult' : 'adults'}
              {reservation.children > 0 && `, ${reservation.children} ${reservation.children === 1 ? 'child' : 'children'}`}
            </span>
          </div>
          <div className='info-item'>
            <span className='info-label'>Estimated Total:</span>
            <span className='info-value'>${reservation.estimatedTotal}</span>
          </div>
        </div>

        {reservation.specialRequests && (
          <div className='special-requests'>
            <span className='info-label'>Special Requests:</span>
            <p className='request-text'>{reservation.specialRequests}</p>
          </div>
        )}

        <div className='meta-info'>
          <span className='submitted-time'>Submitted {formatDateTime(reservation.submittedAt)}</span>
          {reservation.approvedAt && (
            <span className='approved-time'>Approved {formatDateTime(reservation.approvedAt)}</span>
          )}
        </div>
      </div>

      {!isApproved && reservation.status === 'pending' && (
        <div className='card-actions'>
          {!showDenyForm ? (
            <>
              <button 
                className='action-button approve-button'
                onClick={() => onApprove(reservation.id)}
              >
                ✓ Approve Reservation
              </button>
              <button 
                className='action-button deny-button'
                onClick={() => setShowDenyForm(true)}
              >
                ✗ Deny Request
              </button>
            </>
          ) : (
            <div className='deny-form'>
              <label htmlFor={`deny-message-${reservation.id}`}>
                Message to guest (required):
              </label>
              <textarea
                id={`deny-message-${reservation.id}`}
                value={denialMessage}
                onChange={(e) => {
                  setDenialMessage(e.target.value)
                  setDenialError('')
                }}
                placeholder='Let the guest know why their request cannot be accommodated...'
                rows={4}
              />
              {denialError && <span className='error-message'>{denialError}</span>}
              <div className='deny-form-actions'>
                <button 
                  className='action-button deny-confirm-button'
                  onClick={handleDenySubmit}
                >
                  Send Denial
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleDenyCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReservationCard
