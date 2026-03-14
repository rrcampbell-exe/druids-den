import { useState } from 'react'
import './ReservationCard.scss'

// Export helper functions for testing
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export const calculateNights = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = Math.abs(checkOutDate - checkInDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const ReservationCard = ({ reservation, onApprove, onDeny, onCancel, onMessage, onEdit, isApproved = false, expanded = false, loading = false }) => {
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [denialMessage, setDenialMessage] = useState('')
  const [denialError, setDenialError] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancellationMessage, setCancellationMessage] = useState('')
  const [cancellationError, setCancellationError] = useState('')
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [messageError, setMessageError] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editData, setEditData] = useState({
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    specialRequests: '',
    ownerNote: ''
  })
  const [editError, setEditError] = useState('')

  const nights = calculateNights(reservation.checkIn, reservation.checkOut)

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

  const handleEditClick = () => {
    setEditData({
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      adults: reservation.adults,
      children: reservation.children,
      specialRequests: reservation.specialRequests || '',
      ownerNote: reservation.ownerNote || ''
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async () => {
    // Validate dates
    if (!editData.checkIn || !editData.checkOut) {
      setEditError('Check-in and check-out dates are required')
      return
    }

    const checkInDate = new Date(editData.checkIn)
    const checkOutDate = new Date(editData.checkOut)

    if (checkOutDate <= checkInDate) {
      setEditError('Check-out date must be after check-in date')
      return
    }

    // Validate guest count
    if (editData.adults < 1) {
      setEditError('At least 1 adult is required')
      return
    }

    if (editData.adults + editData.children > 10) {
      setEditError('Maximum 10 guests allowed')
      return
    }

    // Call the onEdit callback and await it
    try {
      await onEdit(reservation.id, editData)
      // Only close form and clear error on success
      setShowEditForm(false)
      setEditError('')
    } catch (error) {
      // Keep the form open and show error if edit fails
      setEditError(error.message || 'Failed to update reservation. Please try again.')
    }
  }

  const handleEditCancel = () => {
    setShowEditForm(false)
    setEditError('')
  }

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
                disabled={loading}
              >
                {loading ? '...' : '✓ Approve Reservation'}
              </button>
              <button 
                className='action-button deny-button'
                onClick={() => setShowDenyForm(true)}
                disabled={loading}
              >
                ✗ Deny Request
              </button>
              {!isOwner && (
                <button 
                  className='action-button message-button'
                  onClick={() => setShowMessageForm(true)}
                  disabled={loading}
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
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Denial'}
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleDenyCancel}
                  disabled={loading}
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
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleMessageCancel}
                  disabled={loading}
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
          {!showCancelForm && !showMessageForm && !showEditForm ? (
            <>
              <button 
                className='action-button edit-button'
                onClick={handleEditClick}
                disabled={loading}
              >
                ✎ Edit Reservation
              </button>
              <button 
                className='action-button cancel-reservation-button'
                onClick={() => setShowCancelForm(true)}
                disabled={loading}
              >
                Cancel Reservation
              </button>
              {!isOwner && (
                <button 
                  className='action-button message-button'
                  onClick={() => setShowMessageForm(true)}
                  disabled={loading}
                >
                  💬 Message Guest
                </button>
              )}
            </>
          ) : showEditForm ? (
            <div className='edit-form'>
              <h4>Edit Reservation Details</h4>
              <div className='edit-form-grid'>
                <div className='form-group'>
                  <label htmlFor={`edit-checkin-${reservation.id}`}>Check-in:</label>
                  <input
                    type='date'
                    id={`edit-checkin-${reservation.id}`}
                    value={editData.checkIn}
                    onChange={(e) => {
                      setEditData({ ...editData, checkIn: e.target.value })
                      setEditError('')
                    }}
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor={`edit-checkout-${reservation.id}`}>Check-out:</label>
                  <input
                    type='date'
                    id={`edit-checkout-${reservation.id}`}
                    value={editData.checkOut}
                    onChange={(e) => {
                      setEditData({ ...editData, checkOut: e.target.value })
                      setEditError('')
                    }}
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor={`edit-adults-${reservation.id}`}>Adults:</label>
                  <input
                    type='number'
                    id={`edit-adults-${reservation.id}`}
                    min='1'
                    max='10'
                    value={editData.adults}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 1 : Number(e.target.value)
                      const newAdults = Number.isFinite(value) ? value : 1
                      setEditData({ ...editData, adults: newAdults })
                      // Show proactive validation for total guests
                      if (newAdults + editData.children > 10) {
                        setEditError('Maximum 10 guests total allowed')
                      } else if (newAdults < 1) {
                        setEditError('At least 1 adult is required')
                      } else {
                        setEditError('')
                      }
                    }}
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor={`edit-children-${reservation.id}`}>Children:</label>
                  <input
                    type='number'
                    id={`edit-children-${reservation.id}`}
                    min='0'
                    max='9'
                    value={editData.children}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value)
                      const newChildren = Number.isFinite(value) ? value : 0
                      setEditData({ ...editData, children: newChildren })
                      // Show proactive validation for total guests
                      if (editData.adults + newChildren > 10) {
                        setEditError('Maximum 10 guests total allowed')
                      } else if (editData.adults < 1) {
                        setEditError('At least 1 adult is required')
                      } else {
                        setEditError('')
                      }
                    }}
                  />
                </div>
              </div>
              {!isOwner ? (
                <div className='form-group full-width'>
                  <label htmlFor={`edit-requests-${reservation.id}`}>Special Requests:</label>
                  <textarea
                    id={`edit-requests-${reservation.id}`}
                    value={editData.specialRequests}
                    onChange={(e) => setEditData({ ...editData, specialRequests: e.target.value })}
                    rows={3}
                    placeholder='Special requests or notes...'
                  />
                </div>
              ) : (
                <div className='form-group full-width'>
                  <label htmlFor={`edit-note-${reservation.id}`}>Owner's Note:</label>
                  <textarea
                    id={`edit-note-${reservation.id}`}
                    value={editData.ownerNote}
                    onChange={(e) => setEditData({ ...editData, ownerNote: e.target.value })}
                    rows={3}
                    placeholder='Notes about this owner reservation...'
                  />
                </div>
              )}
              {editError && <span className='error-message'>{editError}</span>}
              <div className='edit-form-actions'>
                <button 
                  className='action-button save-button'
                  onClick={handleEditSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleEditCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
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
                  disabled={loading}
                >
                  {loading ? 'Cancelling...' : (isOwner ? 'Confirm Cancellation' : 'Send Cancellation')}
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleCancelCancel}
                  disabled={loading}
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
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <button 
                  className='action-button cancel-button'
                  onClick={handleMessageCancel}
                  disabled={loading}
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
