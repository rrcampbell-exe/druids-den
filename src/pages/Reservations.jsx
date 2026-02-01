import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import './Reservations.scss'
import { Coelbren, Flower, Leaf, Awen, PageNav, DatePicker, Modal } from '../components'
import { validateReservationForm } from '../utils/formValidation'

const Reservations = () => {
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Reservation Details
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    
    // Additional Information
    specialRequests: '',
    
    // Payment (placeholder for future integration)
    // These would typically be handled by payment provider
    estimatedTotal: 0
  })
  
  const [validationErrors, setValidationErrors] = useState({})
  
  const [touchedFields, setTouchedFields] = useState({})
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navItems = [
    { label: 'Your Information', href: '#your-information' },
    { label: 'Reservation Details', href: '#reservation-details' },
    { label: 'Additional Notes', href: '#additional-notes' }
  ]

  // Parse date string as local date (America/Chicago) to avoid timezone issues
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    date.setHours(0, 0, 0, 0)
    return date
  }

  useEffect(() => {
    // Fetch reservations from database (always fresh, no caching)
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/reservations')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setReservations(data.reservations || [])
      } catch (err) {
        console.error('Error loading reservations:', err)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  // Validate fields when touched to show errors
  useEffect(() => {
    const validation = validateReservationForm(formData)
    
    // Only update errors for fields that have been touched
    const newErrors = {}
    Object.keys(touchedFields).forEach(field => {
      if (touchedFields[field]) {
        newErrors[field] = validation.errors[field] || ''
      }
    })
    
    setValidationErrors(newErrors)
  }, [formData, touchedFields])

  const isDateBlackedOut = (dateString) => {
    const date = parseLocalDate(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const currentYear = new Date().getFullYear()
    const dateYear = date.getFullYear()
    
    // Check if date is in the past
    if (date < today) return true
    
    // Check if date is outside current calendar year
    if (dateYear !== currentYear) return true
    
    // Check if date falls within any approved or pending reservation
    // (including owner reservations)
    for (const reservation of reservations) {
      // Skip cancelled or denied reservations
      if (reservation.status === 'cancelled' || reservation.status === 'denied') continue
      
      const checkIn = parseLocalDate(reservation.checkIn)
      const checkOut = parseLocalDate(reservation.checkOut)
      
      // Date is blacked out if it falls within the reservation range (inclusive of check-in, exclusive of check-out)
      if (date >= checkIn && date < checkOut) {
        return true
      }
    }
    
    return false
  }
  
  const hasBlackoutDatesInRange = (startDateString, endDateString) => {
    const startDate = parseLocalDate(startDateString)
    const endDate = parseLocalDate(endDateString)
    const current = new Date(startDate)
    const blackedOutDates = []
    
    // Check each date in the range (exclusive of check-in and check-out dates)
    current.setDate(current.getDate() + 1)
    while (current < endDate) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      
      // Check if date falls within any approved or pending reservation
      for (const reservation of reservations) {
        // Skip cancelled or denied reservations
        if (reservation.status === 'cancelled' || reservation.status === 'denied') continue
        
        const checkIn = parseLocalDate(reservation.checkIn)
        const checkOut = parseLocalDate(reservation.checkOut)
        const checkDate = parseLocalDate(dateString)
        
        // Date is blacked out if it falls within the reservation range (inclusive of check-in, exclusive of check-out)
        if (checkDate >= checkIn && checkDate < checkOut) {
          blackedOutDates.push(dateString)
          break
        }
      }
      
      current.setDate(current.getDate() + 1)
    }
    
    return blackedOutDates
  }
  
  // Convert reservations to blackout dates array for DatePicker
  const getBlackoutDates = () => {
    const blackoutDates = []
    
    for (const reservation of reservations) {
      // Skip cancelled or denied reservations
      if (reservation.status === 'cancelled' || reservation.status === 'denied') continue
      
      const checkIn = parseLocalDate(reservation.checkIn)
      const checkOut = parseLocalDate(reservation.checkOut)
      const current = new Date(checkIn)
      
      // Start the day AFTER check-in (guests can check out on someone else's check-in date)
      current.setDate(current.getDate() + 1)
      
      // Add all dates in the reservation range (exclusive of check-in, exclusive of check-out)
      while (current < checkOut) {
        const year = current.getFullYear()
        const month = String(current.getMonth() + 1).padStart(2, '0')
        const day = String(current.getDate()).padStart(2, '0')
        const dateString = `${year}-${month}-${day}`
        blackoutDates.push(dateString)
        current.setDate(current.getDate() + 1)
      }
    }
    
    return blackoutDates
  }
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const validatePhone = (phone) => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '')
    // US phone numbers should be 10 digits
    return digitsOnly.length === 10
  }
  
  const formatPhone = (value) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')
    
    // Limit to 10 digits
    const limited = digitsOnly.slice(0, 10)
    
    // Format as (XXX) XXX-XXXX
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    
    // Handle phone formatting
    if (name === 'phone') {
      const formatted = formatPhone(value)
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }
  
  const handleBlur = (e) => {
    const { name } = e.target
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (submitting) return
    
    // Validate entire form
    const validation = validateReservationForm(formData)
    
    if (!validation.valid) {
      // Set all validation errors
      setValidationErrors(validation.errors)
      
      // Mark all fields as touched so errors display
      const allFields = {}
      Object.keys(validation.errors).forEach(field => {
        allFields[field] = true
      })
      setTouchedFields(allFields)
      
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0]
      if (firstErrorField === 'firstName' || firstErrorField === 'lastName' || 
          firstErrorField === 'email' || firstErrorField === 'phone') {
        if (emailRef.current) {
          emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }
    
    // Clear errors if validation passes
    setValidationErrors({})
    
    // Validate check-in date is not blacked out
    if (isDateBlackedOut(formData.checkIn)) {
      setErrorMessage('The selected check-in date is not available. Please choose another date.')
      setShowErrorModal(true)
      return
    }
    
    // Validate no blackout dates in range (excluding check-in and check-out dates)
    const blackedOutInRange = hasBlackoutDatesInRange(formData.checkIn, formData.checkOut)
    if (blackedOutInRange.length > 0) {
      setErrorMessage(`Your selected dates conflict with other reservations. Please select a different date range.`)
      setShowErrorModal(true)
      return
    }
    
    setSubmitting(true)
    
    try {
      // Send reservation email
      const response = await fetch('/api/send-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString()
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowSuccessModal(true)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          checkIn: '',
          checkOut: '',
          adults: 1,
          children: 0,
          specialRequests: '',
          estimatedTotal: 0
        })
        setValidationErrors({
          email: '',
          phone: ''
        })
        setTouchedFields({
          email: false,
          phone: false
        })
      } else {
        throw new Error(data.error || 'Failed to submit reservation')
      }
    } catch (error) {
      console.error('Error submitting reservation:', error)
      setErrorMessage('There was an error submitting your reservation. Please try again or contact us directly at grovekeeper@druidsdenwi.com.')
      setShowErrorModal(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='reservations-page'>
      <div className='page-header'>
        <div>
          <h1>Reservations</h1>
          <Coelbren
            renderAs='h2'
            className='coelbren-subheading' 
          >
            (Reservations)
          </Coelbren>
          <h2 className='subheading'>Your Northwoods Retreat Awaits</h2>
          <div className='bottom-border' />
        </div>
        <Link to='/'>
          <div className='back-navigation'><Awen /> Go Back</div> 
        </Link>
      </div>
      
      <center>
        <Flower />
        <p>Welcome! Please complete the form below to reserve your stay at The Druids Den.</p>
        <p>Please note that reservations submitted here are subject to availability and confirmation. If we're unable to accommodate your request, you'll receive a refund via the same payment method used when you submit this form.</p>
        <Leaf />
      </center>
      
      <div className='page-content-wrapper nav-right'>
        <PageNav items={navItems} />
        
        <main>
          <form onSubmit={handleSubmit} className='reservation-form'>
            <section id='your-information'>
              <h2>Your Information</h2>
              
              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='firstName'>First Name *</label>
                  <input
                    type='text'
                    id='firstName'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touchedFields.firstName && validationErrors.firstName && (
                    <span className='error-message'>{validationErrors.firstName}</span>
                  )}
                </div>
                
                <div className='form-group'>
                  <label htmlFor='lastName'>Last Name *</label>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touchedFields.lastName && validationErrors.lastName && (
                    <span className='error-message'>{validationErrors.lastName}</span>
                  )}
                </div>
              </div>
              
              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='email'>Email Address *</label>
                  <input
                    ref={emailRef}
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                  />
                  {touchedFields.email && validationErrors.email && (
                    <span className='error-message'>{validationErrors.email}</span>
                  )}
                </div>
                
                <div className='form-group'>
                  <label htmlFor='phone'>Phone Number *</label>
                  <input
                    ref={phoneRef}
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder='(555) 123-4567'
                    required
                  />
                  {touchedFields.phone && validationErrors.phone && (
                    <span className='error-message'>{validationErrors.phone}</span>
                  )}
                </div>
              </div>
            </section>
            
            <section id='reservation-details'>
              <h2>Reservation Details</h2>
              
              <DatePicker
                label='Dates of Reservation'
                checkInValue={formData.checkIn}
                checkOutValue={formData.checkOut}
                onCheckInChange={handleInputChange}
                onCheckOutChange={handleInputChange}
                blackoutDates={loading ? [] : getBlackoutDates()}
                required
                loading={loading}
                loadingMessage='Loading available dates...'
              />
              
              <div className='form-row'>
                <div className='form-group'>
                  <label htmlFor='adults'>Adults *</label>
                  <input
                    type='number'
                    id='adults'
                    name='adults'
                    value={formData.adults}
                    onChange={handleInputChange}
                    min='1'
                    max='6'
                    required
                  />
                  <small>Age 13+</small>
                </div>
                
                <div className='form-group'>
                  <label htmlFor='children'>Children</label>
                  <input
                    type='number'
                    id='children'
                    name='children'
                    value={formData.children}
                    onChange={handleInputChange}
                    min='0'
                    max='10'
                  />
                  <small>Ages 0-12</small>
                </div>
              </div>
            </section>
            
            <section id='additional-notes'>
              <h2>Additional Notes</h2>
              
              <div className='form-group'>
                <label htmlFor='specialRequests'>Anything else we should know? (Optional)</label>
                <textarea
                  id='specialRequests'
                  name='specialRequests'
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows='5'
                  maxLength='500'
                  placeholder='Let us know if you have any special requests or requirements for your stay...'
                />
                <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                  {formData.specialRequests.length}/500 characters
                </div>
                {validationErrors.specialRequests && (
                  <span className='error-message'>{validationErrors.specialRequests}</span>
                )}
              </div>
            </section>
            
            <div className='form-actions'>
              <button type='submit' className='submit-button' disabled={submitting || loading}>
                {submitting ? 'Submitting Reservation...' : 'Submit Reservation Request and Make Deposit'}
              </button>
              <p className='disclaimer'>
                * By submitting this form, you are requesting a reservation. 
                Reservations are subject to availability and final confirmation from either Ryan or Lacey. If we're unable to accommodate your request, you'll receive a refund for your deposit via the same payment method used when you submit this form.
              </p>
            </div>
          </form>
        </main>
      </div>
      
      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Reservation Request Received!"
      >
        <p><strong>Thank you for your reservation request!</strong></p>
        
        <ol>
          <li>
            <strong>Check your email</strong> - A confirmation email has been sent to the address you provided. 
            Please check your inbox (and spam folder, just in case).
          </li>
          <li>
            <strong>Complete your deposit</strong> - Click the secure payment link in the confirmation email 
            to make your deposit <strong>within 24 hours</strong>. This holds your reservation.
          </li>
          <li>
            <strong>Final confirmation</strong> - Once we receive your deposit, we'll review your request 
            and send you final confirmation within <strong>24 hours</strong>. If for any reason we cannot 
            honor your reservation, your deposit will be fully refunded.
          </li>
        </ol>
        
        <p>We look forward to hosting you at The Druids Den!</p>
      </Modal>
      
      {/* Error Modal */}
      <Modal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)}
        title="Unable to Complete Request"
      >
        <p>{errorMessage}</p>
      </Modal>
    </div>
  )
}

export default Reservations
