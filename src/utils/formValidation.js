/**
 * Frontend input validation utilities
 * These provide immediate user feedback and prevent obviously invalid data from being sent
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate phone number (US format)
 * @param {string} phone - Phone to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' }
  }
  
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length !== 10) {
    return { valid: false, error: 'Please enter a valid 10-digit US phone number' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate name field
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name) {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  if (name.length > 50) {
    return { valid: false, error: `${fieldName} must be 50 characters or less` }
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate date string (YYYY-MM-DD format)
 * @param {string} dateString - Date to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateDate = (dateString) => {
  if (!dateString) {
    return { valid: false, error: 'Date is required' }
  }
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return { valid: false, error: 'Invalid date format (use YYYY-MM-DD)' }
  }
  
  const date = new Date(dateString + 'T00:00:00.000Z')
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Please enter a valid date' }
  }
  
  // Ensure date is not in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (date < today) {
    return { valid: false, error: 'Date cannot be in the past' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate number of guests
 * @param {number} count - Guest count to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateGuestCount = (count) => {
  const num = parseInt(count, 10)
  
  if (isNaN(num) || num < 1 || num > 10) {
    return { valid: false, error: 'Must have between 1 and 10 guests' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate child count
 * @param {number} count - Child count to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateChildCount = (count) => {
  const num = parseInt(count, 10)
  
  if (isNaN(num) || num < 0 || num > 9) {
    return { valid: false, error: 'Must have between 0 and 9 children' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate special requests text
 * @param {string} text - Special requests text to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateSpecialRequests = (text) => {
  if (text.length > 500) {
    return { valid: false, error: 'Special requests must be 500 characters or less' }
  }
  
  // Check for suspicious patterns (very basic detection)
  if (/<script|javascript:|onerror|onload/i.test(text)) {
    return { valid: false, error: 'Special requests contains invalid characters or patterns' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate entire reservation form
 * @param {object} formData - Form data object
 * @returns {object} - { valid: boolean, errors: object }
 */
export const validateReservationForm = (formData) => {
  const errors = {}
  
  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'First name')
  if (!firstNameValidation.valid) {
    errors.firstName = firstNameValidation.error
  }
  
  // Validate last name
  const lastNameValidation = validateName(formData.lastName, 'Last name')
  if (!lastNameValidation.valid) {
    errors.lastName = lastNameValidation.error
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.valid) {
    errors.email = emailValidation.error
  }
  
  // Validate phone
  const phoneValidation = validatePhone(formData.phone)
  if (!phoneValidation.valid) {
    errors.phone = phoneValidation.error
  }
  
  // Validate check-in date
  const checkInValidation = validateDate(formData.checkIn)
  if (!checkInValidation.valid) {
    errors.checkIn = checkInValidation.error
  }
  
  // Validate check-out date
  const checkOutValidation = validateDate(formData.checkOut)
  if (!checkOutValidation.valid) {
    errors.checkOut = checkOutValidation.error
  }
  
  // Validate that checkout is after check-in
  if (formData.checkIn && formData.checkOut && !errors.checkIn && !errors.checkOut) {
    const checkInDate = new Date(formData.checkIn)
    const checkOutDate = new Date(formData.checkOut)
    if (checkOutDate <= checkInDate) {
      errors.checkOut = 'Check-out date must be after check-in date'
    }
  }
  
  // Validate adults
  const adultsValidation = validateGuestCount(formData.adults)
  if (!adultsValidation.valid) {
    errors.adults = adultsValidation.error
  }
  
  // Validate children
  const childrenValidation = validateChildCount(formData.children)
  if (!childrenValidation.valid) {
    errors.children = childrenValidation.error
  }
  
  // Validate total guest count (adults + children)
  const totalGuests = (formData.adults || 0) + (formData.children || 0)
  if (totalGuests > 10) {
    errors.adults = 'Maximum 10 guests total allowed'
  }
  
  // Validate special requests if provided
  if (formData.specialRequests) {
    const requestsValidation = validateSpecialRequests(formData.specialRequests)
    if (!requestsValidation.valid) {
      errors.specialRequests = requestsValidation.error
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
