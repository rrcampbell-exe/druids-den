/**
 * Input sanitization utilities to prevent XSS, injection attacks, and malicious input
 */

/**
 * Sanitize string input by escaping HTML characters
 * Prevents XSS attacks by converting HTML entities
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string with HTML escaped
 */
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  
  return input.replace(/[&<>"'\/]/g, char => htmlEscapeMap[char])
}

/**
 * Sanitize text input by trimming and removing control characters
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, sanitized: string }
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  const trimmed = sanitizeText(email).toLowerCase()
  
  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, sanitized: '' }
  }
  
  // Additional length validation (RFC 5321)
  if (trimmed.length > 254) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized: trimmed }
}

/**
 * Validate and sanitize phone number (US format)
 * @param {string} phone - Phone number to validate
 * @returns {object} - { valid: boolean, sanitized: string }
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  // Extract only digits
  const digitsOnly = phone.replace(/\D/g, '')
  
  // US phone numbers should be 10 digits
  if (digitsOnly.length !== 10) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized: digitsOnly }
}

/**
 * Sanitize name fields (firstName, lastName)
 * Allows letters, hyphens, apostrophes, and spaces
 * @param {string} name - Name to sanitize
 * @returns {object} - { valid: boolean, sanitized: string }
 */
export const sanitizeName = (name) => {
  if (typeof name !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  const sanitized = sanitizeText(name)
  
  // Allow only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
    return { valid: false, sanitized: '' }
  }
  
  // Length validation (max 50 chars per typical name field)
  if (sanitized.length > 50 || sanitized.length < 1) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized }
}

/**
 * Sanitize long text fields (specialRequests, ownerNotes, etc.)
 * Removes HTML/scripts but preserves line breaks
 * @param {string} text - Text to sanitize
 * @param {number} maxLength - Maximum allowed length (default 1000)
 * @returns {object} - { valid: boolean, sanitized: string }
 */
export const sanitizeLongText = (text, maxLength = 1000) => {
  if (typeof text !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  if (text.length === 0) {
    return { valid: true, sanitized: '' }
  }
  
  let sanitized = text
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, maxLength) // Enforce length limit
  
  // Escape HTML to prevent XSS
  sanitized = sanitizeHtml(sanitized)
  
  return { valid: sanitized.length > 0, sanitized }
}

/**
 * Validate and sanitize date strings (YYYY-MM-DD format)
 * @param {string} dateString - Date to validate
 * @returns {object} - { valid: boolean, sanitized: string }
 */
export const sanitizeDate = (dateString) => {
  if (typeof dateString !== 'string') {
    return { valid: false, sanitized: '' }
  }
  
  const trimmed = dateString.trim()
  
  // Check format: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { valid: false, sanitized: '' }
  }
  
  // Validate it's a real date using noon UTC to avoid timezone boundary issues
  const date = new Date(trimmed + 'T12:00:00.000Z')
  if (isNaN(date.getTime())) {
    return { valid: false, sanitized: '' }
  }
  
  return { valid: true, sanitized: trimmed }
}

/**
 * Validate and sanitize positive integers
 * @param {any} value - Value to validate
 * @param {object} options - { min, max }
 * @returns {object} - { valid: boolean, sanitized: number }
 */
export const sanitizeInteger = (value, options = {}) => {
  const { min = 0, max = 1000 } = options
  
  const num = parseInt(value, 10)
  
  if (isNaN(num) || num < min || num > max) {
    return { valid: false, sanitized: null }
  }
  
  return { valid: true, sanitized: num }
}

/**
 * Comprehensive reservation data sanitization
 * @param {object} reservationData - The raw reservation data
 * @returns {object} - Sanitized reservation data and validation errors
 */
export const sanitizeReservationData = (reservationData) => {
  const errors = {}
  const sanitized = {}
  
  // firstName
  const firstName = sanitizeName(reservationData.firstName)
  if (!firstName.valid) {
    errors.firstName = 'First name is invalid'
  } else {
    sanitized.firstName = firstName.sanitized
  }
  
  // lastName
  const lastName = sanitizeName(reservationData.lastName)
  if (!lastName.valid) {
    errors.lastName = 'Last name is invalid'
  } else {
    sanitized.lastName = lastName.sanitized
  }
  
  // email
  const email = sanitizeEmail(reservationData.email)
  if (!email.valid) {
    errors.email = 'Email address is invalid'
  } else {
    sanitized.email = email.sanitized
  }
  
  // phone
  const phone = sanitizePhone(reservationData.phone)
  if (!phone.valid) {
    errors.phone = 'Phone number is invalid'
  } else {
    sanitized.phone = phone.sanitized
  }
  
  // checkIn date
  const checkIn = sanitizeDate(reservationData.checkIn)
  if (!checkIn.valid) {
    errors.checkIn = 'Check-in date is invalid'
  } else {
    sanitized.checkIn = checkIn.sanitized
  }
  
  // checkOut date
  const checkOut = sanitizeDate(reservationData.checkOut)
  if (!checkOut.valid) {
    errors.checkOut = 'Check-out date is invalid'
  } else {
    sanitized.checkOut = checkOut.sanitized
  }
  
  // adults (has a default in form, but can be missing)
  const adults = sanitizeInteger(
    reservationData.adults !== undefined ? reservationData.adults : 1,
    { min: 1, max: 10 }
  )
  if (!adults.valid) {
    errors.adults = 'Number of adults is invalid'
  } else {
    sanitized.adults = adults.sanitized
  }
  
  // children (optional, default to 0)
  const children = sanitizeInteger(
    reservationData.children !== undefined ? reservationData.children : 0,
    { min: 0, max: 9 }
  )
  if (!children.valid) {
    errors.children = 'Number of children is invalid'
  } else {
    sanitized.children = children.sanitized
  }
  
  // Validate total guest count
  if (sanitized.adults !== undefined && sanitized.children !== undefined) {
    const totalGuests = sanitized.adults + sanitized.children
    if (totalGuests > 10) {
      errors.adults = 'Maximum 10 guests total allowed'
    }
  }
  
  // specialRequests (optional)
  if (reservationData.specialRequests) {
    const specialRequests = sanitizeLongText(reservationData.specialRequests, 500)
    if (specialRequests.valid) {
      sanitized.specialRequests = specialRequests.sanitized
    } else {
      // Optional field, so empty is okay if it was empty
      sanitized.specialRequests = null
    }
  } else {
    sanitized.specialRequests = null
  }
  
  // estimatedTotal (optional, frontend sends it)
  if (reservationData.estimatedTotal !== undefined) {
    const estimatedTotal = sanitizeInteger(reservationData.estimatedTotal, { min: 0, max: 10000 })
    if (estimatedTotal.valid) {
      sanitized.estimatedTotal = estimatedTotal.sanitized
    } else {
      sanitized.estimatedTotal = 0
    }
  } else {
    sanitized.estimatedTotal = 0
  }
  
  return { sanitized, errors }
}
