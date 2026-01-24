import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import './Reservations.scss'
import { Coelbren, Flower, Leaf, Awen, PageNav, DatePicker } from '../components'

const Reservations = () => {
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  
  const [blackoutDates, setBlackoutDates] = useState([])
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
  
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: ''
  })
  
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    phone: false
  })

  const navItems = [
    { label: 'Your Information', href: '#your-information' },
    { label: 'Reservation Details', href: '#reservation-details' },
    { label: 'Additional Notes', href: '#additional-notes' }
  ]

  useEffect(() => {
    // Fetch blackout dates
    fetch('/blackout-dates.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        setBlackoutDates(data.blackoutDates)
      })
      .catch(err => console.error('Error loading blackout dates:', err))
  }, [])

  const isDateBlackedOut = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const currentYear = new Date().getFullYear()
    const dateYear = date.getFullYear()
    
    // Check if date is in the past
    if (date < today) return true
    
    // Check if date is outside current calendar year
    if (dateYear !== currentYear) return true
    
    // Check if date is in blackout list
    if (blackoutDates.includes(dateString)) return true
    
    return false
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
    
    // If it's a date input, check if the date is blacked out
    if ((name === 'checkIn' || name === 'checkOut') && value && isDateBlackedOut(value)) {
      // Show alert and clear the input
      alert(`The date ${value} is not available. Please choose another date.`)
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }))
      return
    }
    
    // Handle phone formatting
    if (name === 'phone') {
      const formatted = formatPhone(value)
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }))
      
      // Validate phone (but don't show error until blur)
      if (formatted && !validatePhone(formatted)) {
        setValidationErrors(prev => ({
          ...prev,
          phone: 'Please enter a valid 10-digit US phone number'
        }))
      } else {
        setValidationErrors(prev => ({
          ...prev,
          phone: ''
        }))
      }
      return
    }
    
    // Validate email (but don't show error until blur)
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }))
      } else {
        setValidationErrors(prev => ({
          ...prev,
          email: ''
        }))
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }
  
  const handleBlur = (e) => {
    const { name } = e.target
    
    if (name === 'email' || name === 'phone') {
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email
    if (!validateEmail(formData.email)) {
      setTouchedFields(prev => ({ ...prev, email: true }))
      emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setTouchedFields(prev => ({ ...prev, phone: true }))
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    // Validate check-in date
    if (isDateBlackedOut(formData.checkIn)) {
      alert('The selected check-in date is not available. Please choose another date.')
      return
    }
    
    // Validate check-out date
    if (isDateBlackedOut(formData.checkOut)) {
      alert('The selected check-out date is not available. Please choose another date.')
      return
    }
    
    // Validate check-out is after check-in
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      alert('Check-out date must be after check-in date.')
      return
    }
    
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
        alert('Reservation request submitted successfully! You will receive a confirmation email shortly.')
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
      alert('There was an error submitting your reservation. Please try again or contact us directly.')
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
                    required
                  />
                </div>
                
                <div className='form-group'>
                  <label htmlFor='lastName'>Last Name *</label>
                  <input
                    type='text'
                    id='lastName'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
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
                blackoutDates={blackoutDates}
                required
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
                  rows='5'
                  placeholder='Let us know if you have any special requests or requirements for your stay...'
                />
              </div>
            </section>
            
            <div className='form-actions'>
              <button type='submit' className='submit-button'>
                Submit Reservation Request and Make Deposit
              </button>
              <p className='disclaimer'>
                * By submitting this form, you are requesting a reservation. 
                Reservations are subject to availability and final confirmation from either Ryan or Lacey. If we're unable to accommodate your request, you'll receive a refund for your deposit via the same payment method used when you submit this form.
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default Reservations
