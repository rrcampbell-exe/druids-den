import { useState } from 'react'
import './ReservationCard.scss'

const ReservationCard = ({ reservation, onApprove, onDeny, onCancel, onMessage, isApproved = false, expanded = false }) => {
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [denialMessage, setDenialMessage] = useState('')
  const [denialError, setDenialError] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [cancellationError, setCancellationError] = useState('')
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [messageError, setMessageError] = useState('')

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

  const handleCancelSubmit = () => {
    // For guest reservations, require a message
    if (!isOwner && !cancellationMessage.trim()) {
      setCancellationError('Please provide a message for the guest')
      return
    }
    onCancel(reservation.id, cancellationMessage || null)
    setShowCancelForm(false)
    setCancellationMessage('')
    setCancellationError('')
  }

  const handleCancelCancel = () => {
    setShowCancelForm(false)
    setCancellationMessage('')
    setCancellationError('')
  }

  const handleMessageSubmit = () => {
    if (!messageContent.trim()) {
      setMessageError('Please enter a message')
      return
    }
    onMessage(reservation.id, messageContent)
    setShowMessageForm(false)
    setMessageContent('')
    setMessageError('')
  }

  const handleMessageCancel = () => {
    setShowMessageForm(false)
    setMessageContent('')
    setMessageError('')
  }

  const nights = calculateNights()
  const isOwner = reservation.isOwnerReservation

  return (
    <div className={`reservation-card ${reservation.status} ${isOwner ? 'owner' : ''} ${expanded ? 'expanded' : ''}`}>
      <div className='card-header'>
        <div className='guest-info'>
          <h3>{isOwner ? 'Owner Reservation' : `${reservation.firstName} ${reservation.lastName}`}</h3>
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
        {!isOwner ? (
          <>
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
          </>
        ) : (
          <>
            {reservation.ownerNote && (
              <div className='owner-note'>
                <span className='info-label'>Owner's Note:</span>
                <p className='note-text'>{reservation.ownerNote}</p>
              </div>
            )}
          </>
        )}

        <div className='meta-info'>
          <span className='submitted-time'>{isOwner ? 'Created' : 'Submitted'} {formatDateTime(reservation.submittedAt)}</span>
          {reservation.approvedAt && !isOwner && (
            <span className='approved-time'>Approved {formatDateTime(reservation.approvedAt)}</span>
          )}
        </div>
      </div>

      {!isApproved && reservation.status === 'pending' && (
        <div className='card-actions'>
          {!showDenyForm && !showMessageForm ? (
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
              {!isOwner && (
                <button 
                  className='action-button message-button'
                  onClick={() => setShowMessageForm(true)}
                >
                  💬 Message Guest
                </button>
              )}
            </>
          ) : showDenyForm ? (
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
          ) : (
            <div className='message-form'>
              <label htmlFor={`message-${reservation.id}`}>
                Message to guest:
              </label>
              <textarea
                id={`message-${reservation.id}`}
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value)
                  setMessageError('')
                }}
                placeholder='Send a custom message to the guest...'
                rows={4}
              />
              {messageError && <span className='error-message'>{messageError}</span>}
              <div className='message-form-actions'>
                <button 
                  className='action-button message-confirm-button'
                  onClick={handleMessageSubmit}
                >
                  Send Message
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleMessageCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isApproved && reservation.status === 'approved' && (
        <div className='card-actions'>
          {!showCancelForm && !showMessageForm ? (
            <>
              <button 
                className='action-button cancel-reservation-button'
                onClick={() => setShowCancelForm(true)}
              >
                Cancel Reservation
              </button>
              {!isOwner && (
                <button 
                  className='action-button message-button'
                  onClick={() => setShowMessageForm(true)}
                >
                  💬 Message Guest
                </button>
              )}
            </>
          ) : showCancelForm ? (
            <div className='cancel-form'>
              {!isOwner && (
                <>
                  <label htmlFor={`cancel-message-${reservation.id}`}>
                    Message to guest (required):
                  </label>
                  <textarea
                    id={`cancel-message-${reservation.id}`}
                    value={cancellationMessage}
                    onChange={(e) => {
                      setCancellationMessage(e.target.value)
                      setCancellationError('')
                    }}
                    placeholder='Let the guest know why their reservation is being cancelled...'
                    rows={4}
                  />
                  {cancellationError && <span className='error-message'>{cancellationError}</span>}
                </>
              )}
              {isOwner && (
                <p className='confirm-text'>Are you sure you want to cancel this owner reservation?</p>
              )}
              <div className='cancel-form-actions'>
                <button 
                  className='action-button cancel-confirm-button'
                  onClick={handleCancelSubmit}
                >
                  {isOwner ? 'Confirm Cancellation' : 'Send Cancellation'}
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleCancelCancel}
                >
                  Nevermind
                </button>
              </div>
            </div>
          ) : (
            <div className='message-form'>
              <label htmlFor={`message-approved-${reservation.id}`}>
                Message to guest:
              </label>
              <textarea
                id={`message-approved-${reservation.id}`}
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value)
                  setMessageError('')
                }}
                placeholder='Send a custom message to the guest...'
                rows={4}
              />
              {messageError && <span className='error-message'>{messageError}</span>}
              <div className='message-form-actions'>
                <button 
                  className='action-button message-confirm-button'
                  onClick={handleMessageSubmit}
                >
                  Send Message
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleMessageCancel}
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
