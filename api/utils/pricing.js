/**
 * Pricing utilities for The Druids Den
 * Single source of truth for pricing calculations
 */

// Nightly rate in dollars
export const NIGHTLY_RATE = 150

/**
 * Calculate number of nights between two dates
 * @param {Date|string} checkIn - Check-in date (YYYY-MM-DD string or Date object)
 * @param {Date|string} checkOut - Check-out date (YYYY-MM-DD string or Date object)
 * @returns {number} Number of nights
 */
export function calculateNights(checkIn, checkOut) {
  let start, end
  
  if (checkIn instanceof Date) {
    start = checkIn
  } else {
    // Parse YYYY-MM-DD locally to avoid UTC timezone conversion
    const [year, month, day] = checkIn.split('T')[0].split('-').map(Number)
    start = new Date(year, month - 1, day)
  }
  
  if (checkOut instanceof Date) {
    end = checkOut
  } else {
    // Parse YYYY-MM-DD locally to avoid UTC timezone conversion
    const [year, month, day] = checkOut.split('T')[0].split('-').map(Number)
    end = new Date(year, month - 1, day)
  }
  
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Calculate estimated total for a reservation
 * @param {Date|string} checkIn - Check-in date
 * @param {Date|string} checkOut - Check-out date
 * @returns {number} Estimated total in dollars
 */
export function calculateEstimatedTotal(checkIn, checkOut) {
  const nights = calculateNights(checkIn, checkOut)
  return nights * NIGHTLY_RATE
}
