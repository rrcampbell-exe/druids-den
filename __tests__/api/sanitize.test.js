import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
  sanitizeDate,
  sanitizeInteger,
  sanitizeLongText,
  sanitizeReservationData
} from '../../api/_utils/sanitize.js'

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('escapes HTML special characters', () => {
      const result = sanitizeHtml('<script>alert("xss")</script>')
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('escapes ampersands', () => {
      const result = sanitizeHtml('Tom & Jerry')
      expect(result).toBe('Tom &amp; Jerry')
    })

    it('escapes quotes', () => {
      const result = sanitizeHtml('He said "Hello"')
      expect(result).toBe('He said &quot;Hello&quot;')
    })

    it('escapes apostrophes', () => {
      const result = sanitizeHtml("It's a test")
      expect(result).toBe('It&#39;s a test')
    })

    it('escapes forward slashes', () => {
      const result = sanitizeHtml('url/path/to/file')
      expect(result).toBe('url&#x2F;path&#x2F;to&#x2F;file')
    })

    it('escapes greater than and less than', () => {
      const result = sanitizeHtml('5 < 10 > 3')
      expect(result).toBe('5 &lt; 10 &gt; 3')
    })

    it('handles multiple special characters', () => {
      const result = sanitizeHtml('<div class="test">Content & more</div>')
      expect(result).toContain('&lt;div')
      expect(result).toContain('&amp;')
      expect(result).toContain('&gt;')
    })

    it('returns non-string input unchanged', () => {
      expect(sanitizeHtml(123)).toBe(123)
      expect(sanitizeHtml(null)).toBe(null)
    })

    it('handles empty string', () => {
      const result = sanitizeHtml('')
      expect(result).toBe('')
    })
  })

  describe('sanitizeText', () => {
    it('trims whitespace', () => {
      const result = sanitizeText('  hello world  ')
      expect(result).toBe('hello world')
    })

    it('removes control characters', () => {
      const result = sanitizeText('hello\x00world\x1ftest')
      expect(result).toBe('helloworldtest')
    })

    it('normalizes multiple spaces', () => {
      const result = sanitizeText('hello    world')
      expect(result).toBe('hello world')
    })

    it('normalizes tabs and newlines by removing them', () => {
      // sanitizeText removes control characters (including tabs and newlines)
      const result = sanitizeText('hello\t\n\n\tworld')
      expect(result).toBe('helloworld')
    })

    it('returns non-string input unchanged', () => {
      expect(sanitizeText(123)).toBe(123)
    })

    it('preserves normal text', () => {
      const result = sanitizeText('John Doe')
      expect(result).toBe('John Doe')
    })
  })

  describe('sanitizeEmail', () => {
    it('accepts valid email and returns lowercase', () => {
      const result = sanitizeEmail('John@Example.COM')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('john@example.com')
    })

    it('trims email', () => {
      const result = sanitizeEmail('  john@example.com  ')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('john@example.com')
    })

    it('rejects invalid email format', () => {
      const result = sanitizeEmail('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.sanitized).toBe('')
    })

    it('rejects non-string input', () => {
      const result = sanitizeEmail(null)
      expect(result.valid).toBe(false)
    })

    it('rejects email exceeding 254 chars', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      const result = sanitizeEmail(longEmail)
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizePhone', () => {
    it('accepts valid 10-digit phone', () => {
      const result = sanitizePhone('5551234567')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('5551234567')
    })

    it('extracts digits from formatted phone', () => {
      const result = sanitizePhone('(555) 123-4567')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('5551234567')
    })

    it('rejects phone with wrong digit count', () => {
      const result = sanitizePhone('555123456')
      expect(result.valid).toBe(false)
    })

    it('rejects non-string input', () => {
      const result = sanitizePhone(null)
      expect(result.valid).toBe(false)
    })

    it('rejects phone with no digits', () => {
      const result = sanitizePhone('no-digits-here')
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizeName', () => {
    it('accepts valid name', () => {
      const result = sanitizeName('John Doe')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('John Doe')
    })

    it('accepts name with hyphens', () => {
      const result = sanitizeName('Mary-Jane')
      expect(result.valid).toBe(true)
    })

    it('accepts name with apostrophes', () => {
      const result = sanitizeName("O'Brien")
      expect(result.valid).toBe(true)
    })

    it('trims name', () => {
      const result = sanitizeName('  John  ')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('John')
    })

    it('rejects name with numbers', () => {
      const result = sanitizeName('John123')
      expect(result.valid).toBe(false)
    })

    it('rejects name with special characters', () => {
      const result = sanitizeName('John@Doe')
      expect(result.valid).toBe(false)
    })

    it('rejects name exceeding 50 chars', () => {
      const result = sanitizeName('A'.repeat(51))
      expect(result.valid).toBe(false)
    })

    it('rejects empty name', () => {
      const result = sanitizeName('')
      expect(result.valid).toBe(false)
    })

    it('rejects non-string input', () => {
      const result = sanitizeName(null)
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizeDate', () => {
    it('accepts valid date', () => {
      const result = sanitizeDate('2027-06-15')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('2027-06-15')
    })

    it('accepts past dates (format validation only)', () => {
      // sanitizeDate only validates format and date validity, not recency
      const result = sanitizeDate('2025-01-01')
      expect(result.valid).toBe(true)
    })

    it('rejects invalid format', () => {
      const result = sanitizeDate('06/15/2027')
      expect(result.valid).toBe(false)
    })

    it('rejects impossible dates like Feb 30', () => {
      const result = sanitizeDate('2027-02-30')
      expect(result.valid).toBe(false)
    })

    it('accepts valid leap day', () => {
      const result = sanitizeDate('2028-02-29')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('2028-02-29')
    })

    it('rejects non-leap year Feb 29', () => {
      const result = sanitizeDate('2027-02-29')
      expect(result.valid).toBe(false)
    })

    it('trims date', () => {
      const result = sanitizeDate('  2027-06-15  ')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('2027-06-15')
    })

    it('rejects non-string input', () => {
      const result = sanitizeDate(null)
      expect(result.valid).toBe(false)
    })

    it('rejects date with wrong format pattern', () => {
      const result = sanitizeDate('2027-6-15')
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizeInteger', () => {
    it('accepts valid integer', () => {
      const result = sanitizeInteger(5, { min: 1, max: 10 })
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe(5)
    })

    it('accepts string integer', () => {
      const result = sanitizeInteger('5', { min: 1, max: 10 })
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe(5)
    })

    it('accepts minimum value', () => {
      const result = sanitizeInteger(1, { min: 1, max: 10 })
      expect(result.valid).toBe(true)
    })

    it('accepts maximum value', () => {
      const result = sanitizeInteger(10, { min: 1, max: 10 })
      expect(result.valid).toBe(true)
    })

    it('rejects below minimum', () => {
      const result = sanitizeInteger(0, { min: 1, max: 10 })
      expect(result.valid).toBe(false)
      expect(result.sanitized).toBe(null)
    })

    it('rejects above maximum', () => {
      const result = sanitizeInteger(11, { min: 1, max: 10 })
      expect(result.valid).toBe(false)
    })

    it('rejects non-numeric', () => {
      const result = sanitizeInteger('abc', { min: 1, max: 10 })
      expect(result.valid).toBe(false)
    })

    it('uses default options (min: 0, max: 1000)', () => {
      const result = sanitizeInteger(500, {})
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe(500)
    })

    it('rejects with default options if value exceeds max', () => {
      const result = sanitizeInteger(1001, {})
      expect(result.valid).toBe(false)
    })
  })

  describe('sanitizeLongText', () => {
    it('accepts valid text', () => {
      const result = sanitizeLongText('Hello world')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('Hello world')
    })

    it('escapes HTML characters', () => {
      const result = sanitizeLongText('<script>alert(1)</script>')
      expect(result.sanitized).toContain('&lt;')
      expect(result.sanitized).toContain('&gt;')
    })

    it('removes control characters', () => {
      const result = sanitizeLongText('hello\x00world')
      expect(result.sanitized).toBe('helloworld')
    })

    it('enforces max length', () => {
      const longText = 'A'.repeat(1001)
      const result = sanitizeLongText(longText, 1000)
      expect(result.sanitized.length).toBeLessThanOrEqual(1000)
    })

    it('returns valid true for text exceeding max length but gets truncated', () => {
      // Text that exceeds max length gets truncated to max length,
      // so valid is true as long as there's content
      const longText = 'A'.repeat(101)
      const result = sanitizeLongText(longText, 100)
      expect(result.sanitized.length).toBe(100)
      expect(result.valid).toBe(true)
    })

    it('accepts empty string', () => {
      const result = sanitizeLongText('')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('')
    })

    it('uses custom max length', () => {
      // sanitizeLongText truncates to max length without error
      const result = sanitizeLongText('A'.repeat(501), 500)
      expect(result.sanitized.length).toBe(500)
      expect(result.valid).toBe(true)
    })

    it('trims whitespace', () => {
      const result = sanitizeLongText('  hello  ')
      expect(result.sanitized).toBe('hello')
    })
  })

  describe('sanitizeReservationData', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '5551234567',
      checkIn: '2027-06-15',
      checkOut: '2027-06-17',
      adults: 2,
      children: 1,
      specialRequests: 'Extra towels'
    }

    it('sanitizes valid reservation data', () => {
      const result = sanitizeReservationData(validData)
      expect(result.errors).toEqual({})
      expect(result.sanitized.firstName).toBe('John')
      expect(result.sanitized.email).toBe('john@example.com')
    })

    it('returns errors for invalid firstName', () => {
      const data = { ...validData, firstName: 'John123' }
      const result = sanitizeReservationData(data)
      expect(result.errors.firstName).toBeDefined()
    })

    it('returns errors for invalid email', () => {
      const data = { ...validData, email: 'invalid' }
      const result = sanitizeReservationData(data)
      expect(result.errors.email).toBeDefined()
    })

    it('returns errors for invalid phone', () => {
      const data = { ...validData, phone: '555' }
      const result = sanitizeReservationData(data)
      expect(result.errors.phone).toBeDefined()
    })

    it('returns errors for invalid checkIn date format', () => {
      const data = { ...validData, checkIn: 'invalid-date' }
      const result = sanitizeReservationData(data)
      expect(result.errors.checkIn).toBeDefined()
    })

    it('returns errors for invalid adults', () => {
      const data = { ...validData, adults: 0 }
      const result = sanitizeReservationData(data)
      expect(result.errors.adults).toBeDefined()
    })

    it('handles missing optional children field', () => {
      const data = { ...validData }
      delete data.children
      const result = sanitizeReservationData(data)
      expect(result.errors.children).toBeUndefined()
      expect(result.sanitized.children).toBe(0)
    })

    it('handles missing optional specialRequests field', () => {
      const data = { ...validData }
      delete data.specialRequests
      const result = sanitizeReservationData(data)
      expect(result.sanitized.specialRequests).toBe(null)
    })

    it('converts email to lowercase', () => {
      const data = { ...validData, email: 'John@Example.COM' }
      const result = sanitizeReservationData(data)
      expect(result.sanitized.email).toBe('john@example.com')
    })

    it('extracts phone digits', () => {
      const data = { ...validData, phone: '(555) 123-4567' }
      const result = sanitizeReservationData(data)
      expect(result.sanitized.phone).toBe('5551234567')
    })

    it('handles HTML in specialRequests', () => {
      const data = { ...validData, specialRequests: '<script>alert(1)</script>' }
      const result = sanitizeReservationData(data)
      expect(result.errors.specialRequests).toBeUndefined()
      expect(result.sanitized.specialRequests).toContain('&lt;')
    })

    it('returns multiple errors for multiple invalid fields', () => {
      const data = {
        ...validData,
        firstName: 'John123',
        email: 'invalid',
        phone: '555'
      }
      const result = sanitizeReservationData(data)
      expect(Object.keys(result.errors).length).toBeGreaterThan(1)
    })

    it('handles undefined adults as default 1', () => {
      const data = { ...validData }
      data.adults = undefined
      const result = sanitizeReservationData(data)
      expect(result.sanitized.adults).toBe(1)
    })

    it('sanitizes names with extra spaces', () => {
      const data = { ...validData, firstName: '  John  ' }
      const result = sanitizeReservationData(data)
      expect(result.sanitized.firstName).toBe('John')
    })

    it('rejects reservations with more than 10 total guests', () => {
      const data = { ...validData, adults: 6, children: 5 }
      const result = sanitizeReservationData(data)
      expect(result.errors.adults).toBe('Maximum 10 guests total allowed')
    })

    it('accepts reservations with exactly 10 total guests', () => {
      const data = { ...validData, adults: 6, children: 4 }
      const result = sanitizeReservationData(data)
      expect(result.errors.adults).toBeUndefined()
      expect(result.sanitized.adults).toBe(6)
      expect(result.sanitized.children).toBe(4)
    })

    it('accepts various combinations under 10 guests', () => {
      const combinations = [
        { adults: 1, children: 0 },
        { adults: 5, children: 5 },
        { adults: 8, children: 2 },
        { adults: 10, children: 0 },
        { adults: 3, children: 7 }
      ]
      
      combinations.forEach(combo => {
        const data = { ...validData, ...combo }
        const result = sanitizeReservationData(data)
        expect(result.errors.adults).toBeUndefined()
        expect(result.sanitized.adults).toBe(combo.adults)
        expect(result.sanitized.children).toBe(combo.children)
      })
    })
  })
})
