// Feedback page where guests can leave reviews
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import Awen from '../components/Awen'
import './Feedback.scss'

const Feedback = () => {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  
  // Feedback form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    validateAndLoadReservation()
  }, [reservationId])

  const validateAndLoadReservation = async () => {
    setLoading(true)
    setError(null)

    // Validate UUID format (res-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^res-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!reservationId || !uuidRegex.test(reservationId)) {
      setError('Invalid feedback link. Please check your email for the correct link.')
      setLoading(false)
      return
    }

    try {
      // TODO: Replace with API call to fetch reservation
      // For now, load from mock data
      const response = await fetch('/mock-reservations.json')
      const data = await response.json()
      const reservations = data.reservations || data
      
      const foundReservation = reservations.find(res => res.id === reservationId)
      
      if (!foundReservation) {
        setError('Reservation not found. This feedback link may be invalid or expired.')
        setLoading(false)
        return
      }

      // Check if reservation is completed (checkout date has passed)
      const checkOutDate = new Date(foundReservation.checkOut)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkOutDate > today) {
        setError('This reservation hasn\'t been completed yet. You\'ll receive a feedback link after your checkout date.')
        setLoading(false)
        return
      }

      // Check if feedback already submitted
      if (foundReservation.feedback) {
        setSubmitted(true)
      }

      setReservation(foundReservation)
      setLoading(false)
    } catch (err) {
      console.error('Error loading reservation:', err)
      setError('Unable to load reservation information. Please try again later.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (wouldRecommend === null) {
      setError('Please let us know if you would recommend us')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      // TODO: Replace with actual API call
      const feedback = {
        reservationId,
        rating,
        review: review.trim(),
        wouldRecommend,
        submittedAt: new Date().toISOString()
      }
      
      console.log('Submitting feedback:', feedback)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitted(true)
      setReservation({ ...reservation, feedback })
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className='feedback-page'>
        <div className='feedback-container loading'>
          <div className='awen-center'>
            <Awen size={60} />
          </div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !reservation) {
    return (
      <div className='feedback-page'>
        <div className='feedback-container error'>
          <div className='awen-center'>
            <Awen size={60} />
          </div>
          <h1>Unable to Load Feedback Form</h1>
          <p className='error-message'>{error}</p>
          <button onClick={() => navigate('/')} className='btn-home'>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // Already submitted state
  if (submitted) {
    return (
      <div className='feedback-page'>
        <div className='feedback-container success'>
          <div className='awen-center'>
            <Awen size={60} />
          </div>
          <h1>Thank You!</h1>
          <p>Your feedback has been submitted. We truly appreciate you taking the time to share your experience.</p>
          <p>We hope to welcome you back to The Druids Den soon!</p>
          <div className='signature'>
            <p>— Ryan and Lacey</p>
          </div>
          <button onClick={() => navigate('/')} className='btn-home'>
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  // Feedback form
  return (
    <div className='feedback-page'>
      <div className='feedback-container'>
        <div className='awen-center'>
          <Awen size={60} />
        </div>
        <h1>How Was Your Stay, {reservation.firstName}?</h1>
        <p className='subtitle'>We'd love to hear about your experience at The Druids Den</p>
        <p className='reservation-info'>
          Stay: {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
        </p>
        
        <form onSubmit={handleSubmit} className='feedback-form'>
          <div className='form-section'>
            <label>Overall Rating <span className='required'>*</span></label>
            <div className='star-rating'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className='form-section'>
            <label htmlFor='review'>Tell us about your stay <span className='optional'>(Optional)</span></label>
            <textarea
              id='review'
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder='What did you enjoy most? Is there anything we could improve?'
              rows={6}
              maxLength={1000}
            />
            <span className='char-count'>{review.length}/1000</span>
          </div>

          <div className='form-section'>
            <label>Would you recommend The Druids Den to friends and family? <span className='required'>*</span></label>
            <div className='recommendation-buttons'>
              <button
                type='button'
                className={`recommend-button ${wouldRecommend === true ? 'selected' : ''}`}
                onClick={() => setWouldRecommend(true)}
              >
                👍 Yes
              </button>
              <button
                type='button'
                className={`recommend-button ${wouldRecommend === false ? 'selected' : ''}`}
                onClick={() => setWouldRecommend(false)}
              >
                👎 No
              </button>
            </div>
          </div>

          {error && <div className='error-message'>{error}</div>}

          <button type='submit' className='submit-button' disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Feedback
