import { describe, it, expect } from 'vitest'
import { NIGHTLY_RATE, calculateNights, calculateEstimatedTotal } from '../../../api/utils/pricing.js'

describe('pricing utilities', () => {
  describe('NIGHTLY_RATE', () => {
    it('should be defined as a number', () => {
      expect(NIGHTLY_RATE).toBeDefined()
      expect(typeof NIGHTLY_RATE).toBe('number')
    })

    it('should be $150', () => {
      expect(NIGHTLY_RATE).toBe(150)
    })

    it('should be a positive value', () => {
      expect(NIGHTLY_RATE).toBeGreaterThan(0)
    })
  })

  describe('calculateNights', () => {
    describe('with YYYY-MM-DD strings', () => {
      it('calculates nights for single night stay', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-02'
        expect(calculateNights(checkIn, checkOut)).toBe(1)
      })

      it('calculates nights for multi-night stay', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-05'
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('calculates nights for week-long stay', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-08'
        expect(calculateNights(checkIn, checkOut)).toBe(7)
      })

      it('calculates nights spanning month boundary', () => {
        const checkIn = '2026-01-30'
        const checkOut = '2026-02-03'
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('calculates nights spanning year boundary', () => {
        const checkIn = '2025-12-30'
        const checkOut = '2026-01-03'
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('handles dates with ISO-8601 time component', () => {
        const checkIn = '2026-02-01T12:00:00.000Z'
        const checkOut = '2026-02-05T12:00:00.000Z'
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('returns 0 for same-day check-in and check-out', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-01'
        expect(calculateNights(checkIn, checkOut)).toBe(0)
      })
    })

    describe('with Date objects', () => {
      it('calculates nights for Date objects', () => {
        const checkIn = new Date(2026, 1, 1) // Feb 1, 2026
        const checkOut = new Date(2026, 1, 5) // Feb 5, 2026
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('handles single night with Date objects', () => {
        const checkIn = new Date(2026, 1, 1)
        const checkOut = new Date(2026, 1, 2)
        expect(calculateNights(checkIn, checkOut)).toBe(1)
      })

      it('returns 0 for same Date objects', () => {
        const date = new Date(2026, 1, 1)
        expect(calculateNights(date, date)).toBe(0)
      })
    })

    describe('with mixed input types', () => {
      it('handles Date object for checkIn and string for checkOut', () => {
        const checkIn = new Date(2026, 1, 1)
        const checkOut = '2026-02-05'
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('handles string for checkIn and Date object for checkOut', () => {
        const checkIn = '2026-02-01'
        const checkOut = new Date(2026, 1, 5)
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })
    })

    describe('timezone handling', () => {
      it('avoids timezone issues with YYYY-MM-DD strings', () => {
        // These dates should always calculate to exactly 1 night
        // regardless of the user's timezone
        const checkIn = '2026-02-15'
        const checkOut = '2026-02-16'
        expect(calculateNights(checkIn, checkOut)).toBe(1)
      })

      it('handles dates across DST boundary', () => {
        // March 8, 2026 is when DST begins in US
        const checkIn = '2026-03-07'
        const checkOut = '2026-03-09'
        expect(calculateNights(checkIn, checkOut)).toBe(2)
      })
    })

    describe('edge cases', () => {
      it('handles reversed dates with Math.abs', () => {
        const checkIn = '2026-02-05'
        const checkOut = '2026-02-01'
        // Function uses Math.abs, so reversed dates still work
        expect(calculateNights(checkIn, checkOut)).toBe(4)
      })

      it('handles leap year dates', () => {
        const checkIn = '2024-02-28'
        const checkOut = '2024-03-01'
        expect(calculateNights(checkIn, checkOut)).toBe(2)
      })
    })
  })

  describe('calculateEstimatedTotal', () => {
    describe('with YYYY-MM-DD strings', () => {
      it('calculates total for single night', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-02'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(150)
      })

      it('calculates total for multi-night stay', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-05'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(600) // 4 nights * $150
      })

      it('calculates total for week-long stay', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-08'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(1050) // 7 nights * $150
      })

      it('calculates total for 10-night stay', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-11'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(1500) // 10 nights * $150
      })

      it('returns 0 for same-day check-in and check-out', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-01'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(0)
      })
    })

    describe('with Date objects', () => {
      it('calculates total for Date objects', () => {
        const checkIn = new Date(2026, 1, 1)
        const checkOut = new Date(2026, 1, 5)
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(600) // 4 nights * $150
      })

      it('calculates total for single night with Date objects', () => {
        const checkIn = new Date(2026, 1, 1)
        const checkOut = new Date(2026, 1, 2)
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(150)
      })
    })

    describe('with mixed input types', () => {
      it('handles Date object and string combination', () => {
        const checkIn = new Date(2026, 1, 1)
        const checkOut = '2026-02-05'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(600)
      })

      it('handles string and Date object combination', () => {
        const checkIn = '2026-02-01'
        const checkOut = new Date(2026, 1, 5)
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(600)
      })
    })

    describe('integration with NIGHTLY_RATE', () => {
      it('uses NIGHTLY_RATE constant for calculations', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-05'
        const nights = 4
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(nights * NIGHTLY_RATE)
      })

      it('returns whole dollar amounts', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-08'
        const total = calculateEstimatedTotal(checkIn, checkOut)
        expect(Number.isInteger(total)).toBe(true)
        expect(total).toBe(1050)
      })
    })

    describe('real-world examples', () => {
      it('calculates weekend stay (Fri-Sun)', () => {
        const checkIn = '2026-02-06' // Friday
        const checkOut = '2026-02-08' // Sunday
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(300) // 2 nights
      })

      it('calculates extended weekend (Fri-Mon)', () => {
        const checkIn = '2026-02-06' // Friday
        const checkOut = '2026-02-09' // Monday
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(450) // 3 nights
      })

      it('calculates two-week vacation', () => {
        const checkIn = '2026-02-01'
        const checkOut = '2026-02-15'
        expect(calculateEstimatedTotal(checkIn, checkOut)).toBe(2100) // 14 nights
      })
    })
  })
})
