import { describe, it, expect } from 'vitest'
import {
  generatePreArrivalEmail,
  generatePostCheckoutEmail,
  generateDenialEmail,
  generateCancellationEmail,
  generateReservationModificationEmail,
  generateCustomMessageEmail,
  generateNewUserNotificationEmail,
  generateAccountApprovedEmail,
  generateAccountDeniedEmail,
  generateAccountRevokedEmail
} from '../../api/utils/dashboardEmailTemplates'

describe('dashboardEmailTemplates', () => {
  const mockReservation = {
    id: 'res-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    checkIn: '2026-03-01',
    checkOut: '2026-03-03',
    adults: 2,
    children: 0
  }

  const mockUser = {
    firstName: 'Aster',
    lastName: 'Bloom',
    email: 'aster@example.com',
    createdAt: '2026-03-15T10:30:00.000Z'
  }

  describe('generatePreArrivalEmail', () => {
    it('generates email with required fields', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'MyWiFi123')
      
      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
    })

    it('includes guest first name in email', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'MyWiFi123')
      
      expect(result.text).toContain('John')
      expect(result.html).toContain('John')
    })

    it('includes door code in email', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'MyWiFi123')
      
      expect(result.text).toContain('1234')
      expect(result.html).toContain('1234')
    })

    it('includes WiFi password in email', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'MyWiFi123')
      
      expect(result.text).toContain('MyWiFi123')
      expect(result.html).toContain('MyWiFi123')
    })

    it('includes check-in date in email', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'MyWiFi123')
      
      // Date should display exactly as submitted: 2026-03-01 -> March 1, 2026
      expect(result.text).toContain('March 1, 2026')
      expect(result.html).toContain('March 1, 2026')
    })

    it('has welcoming subject line', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'MyWiFi123')
      
      expect(result.subject).toContain('Check-in Instructions')
      expect(result.subject).toContain('Druids Den')
    })
  })

  describe('generatePostCheckoutEmail', () => {
    it('generates email with required fields', () => {
      const result = generatePostCheckoutEmail(mockReservation)
      
      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
    })

    it('includes guest first name', () => {
      const result = generatePostCheckoutEmail(mockReservation)
      
      expect(result.text).toContain('John')
      expect(result.html).toContain('John')
    })

    it('includes check-in and checkout dates', () => {
      const result = generatePostCheckoutEmail(mockReservation)
      
      // Dates should display exactly as submitted: 2026-03-01 -> March 1, 2026-03-03 -> March 3
      expect(result.text).toContain('March 1, 2026')
      expect(result.text).toContain('March 3, 2026')
    })

    it('includes feedback link with reservation ID', () => {
      const result = generatePostCheckoutEmail(mockReservation, 'https://example.com')
      
      expect(result.text).toContain('https://example.com/feedback/res-123')
      expect(result.html).toContain('https://example.com/feedback/res-123')
    })

    it('uses default base URL if not provided', () => {
      const result = generatePostCheckoutEmail(mockReservation)
      
      expect(result.text).toContain('https://druidsdenwi.com/feedback/res-123')
    })

    it('has thank you subject line', () => {
      const result = generatePostCheckoutEmail(mockReservation)
      
      expect(result.subject).toContain('Thank You')
      expect(result.subject).toContain('Druids Den')
    })

    it('does not include discount information', () => {
      const result = generatePostCheckoutEmail(mockReservation)
      
      expect(result.text).not.toContain('10%')
      expect(result.text).not.toContain('discount')
      expect(result.html).not.toContain('10%')
      expect(result.html).not.toContain('discount')
    })
  })

  describe('generateDenialEmail', () => {
    it('generates email with required fields', () => {
      const result = generateDenialEmail(mockReservation, 'Dates unavailable')
      
      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
    })

    it('includes guest first name', () => {
      const result = generateDenialEmail(mockReservation, 'Dates unavailable')
      
      expect(result.text).toContain('John')
      expect(result.html).toContain('John')
    })

    it('includes custom denial message', () => {
      const customMessage = 'Unfortunately, those dates are already booked.'
      const result = generateDenialEmail(mockReservation, customMessage)
      
      expect(result.text).toContain(customMessage)
      expect(result.html).toContain(customMessage)
    })

    it('includes check-in and checkout dates', () => {
      const result = generateDenialEmail(mockReservation, 'Dates unavailable')
      
      // Dates should display exactly as submitted: 2026-03-01 -> March 1, 2026-03-03 -> March 3
      expect(result.text).toContain('March 1, 2026')
      expect(result.text).toContain('March 3, 2026')
    })

    it('has apologetic subject line', () => {
      const result = generateDenialEmail(mockReservation, 'Dates unavailable')
      
      expect(result.subject).toContain('Reservation Request')
      expect(result.subject).toContain('Druids Den')
    })

    it('is polite and apologetic', () => {
      const result = generateDenialEmail(mockReservation, 'Dates unavailable')
      
      expect(result.text).toContain('Thank you for your interest')
      expect(result.html).toContain('Thank you for your interest')
    })
  })

  describe('generateCancellationEmail', () => {
    it('generates email with required fields', () => {
      const result = generateCancellationEmail(mockReservation, 'Unexpected maintenance')
      
      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
    })

    it('includes guest first name', () => {
      const result = generateCancellationEmail(mockReservation, 'Unexpected maintenance')
      
      expect(result.text).toContain('John')
      expect(result.html).toContain('John')
    })

    it('includes custom cancellation message', () => {
      const customMessage = 'We need to cancel due to emergency repairs.'
      const result = generateCancellationEmail(mockReservation, customMessage)
      
      expect(result.text).toContain(customMessage)
      expect(result.html).toContain(customMessage)
    })

    it('includes check-in and checkout dates', () => {
      const result = generateCancellationEmail(mockReservation, 'Unexpected maintenance')
      
      // Dates should display exactly as submitted: 2026-03-01 -> March 1, 2026-03-03 -> March 3
      expect(result.text).toContain('March 1, 2026')
      expect(result.text).toContain('March 3, 2026')
    })

    it('has cancellation in subject line', () => {
      const result = generateCancellationEmail(mockReservation, 'Unexpected maintenance')
      
      expect(result.subject).toContain('Cancelled')
      expect(result.subject).toContain('Druids Den')
    })

    it('is apologetic', () => {
      const result = generateCancellationEmail(mockReservation, 'Unexpected maintenance')
      
      expect(result.text).toContain('apologize')
      expect(result.html).toContain('apologize')
    })
  })

  describe('generateCustomMessageEmail', () => {
    it('generates email with required fields', () => {
      const result = generateCustomMessageEmail(mockReservation, 'Looking forward to your visit!')
      
      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
    })

    it('includes guest first name', () => {
      const result = generateCustomMessageEmail(mockReservation, 'Looking forward to your visit!')
      
      expect(result.text).toContain('John')
      expect(result.html).toContain('John')
    })

    it('includes custom message', () => {
      const customMessage = 'We received your special request for early check-in.'
      const result = generateCustomMessageEmail(mockReservation, customMessage)
      
      expect(result.text).toContain(customMessage)
      expect(result.html).toContain(customMessage)
    })

    it('has generic subject line', () => {
      const result = generateCustomMessageEmail(mockReservation, 'Test message')
      
      expect(result.subject).toContain('Message')
      expect(result.subject).toContain('Druid\'s Den')
    })

    it('is signed by owners', () => {
      const result = generateCustomMessageEmail(mockReservation, 'Test message')
      
      expect(result.text).toContain('Ryan and Lacey')
      expect(result.html).toContain('Ryan and Lacey')
    })
  })

  describe('generateNewUserNotificationEmail', () => {
    it('generates email with required fields', () => {
      const result = generateNewUserNotificationEmail(mockUser)

      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
    })

    it('includes the guest details and dashboard link', () => {
      const result = generateNewUserNotificationEmail(mockUser)

      expect(result.subject).toContain('Aster Bloom')
      expect(result.text).toContain('Aster Bloom')
      expect(result.text).toContain('aster@example.com')
      expect(result.text).toContain('https://druidsdenwi.com/dashboard')
      expect(result.html).toContain('Guest Approval Needed')
      expect(result.html).toContain('Open Dashboard')
    })

    it('falls back to New guest when no name is available', () => {
      const result = generateNewUserNotificationEmail({ email: 'guest@example.com' })

      expect(result.subject).toContain('New guest')
      expect(result.text).toContain('Name: New guest')
    })
  })

  describe('generateAccountApprovedEmail', () => {
    it('includes approval messaging', () => {
      const result = generateAccountApprovedEmail(mockUser)

      expect(result.subject).toContain('approved')
      expect(result.text).toContain('Aster Bloom')
      expect(result.text).toContain('submit a reservation request')
      expect(result.html).toContain("You're approved")
    })

    it('falls back to friend when no name is available', () => {
      const result = generateAccountApprovedEmail({ email: 'guest@example.com' })

      expect(result.text).toContain('Hi friend')
    })
  })

  describe('generateAccountDeniedEmail', () => {
    it('includes denial messaging', () => {
      const result = generateAccountDeniedEmail(mockUser)

      expect(result.subject).toContain('guest account')
      expect(result.text).toContain('Aster Bloom')
      expect(result.text).toContain('has not been approved')
      expect(result.html).toContain('Guest account update')
    })
  })

  describe('generateAccountRevokedEmail', () => {
    it('includes revoked access messaging', () => {
      const result = generateAccountRevokedEmail(mockUser)

      expect(result.subject).toContain('access has changed')
      expect(result.text).toContain('Aster Bloom')
      expect(result.text).toContain('has been revoked')
      expect(result.html).toContain('Reservation access update')
    })
  })

  describe('HTML email structure', () => {
    it('all HTML emails have proper structure with meta tags', () => {
      const emails = [
        generatePreArrivalEmail(mockReservation, '1234', 'wifi'),
        generatePostCheckoutEmail(mockReservation),
        generateDenialEmail(mockReservation, 'test'),
        generateCancellationEmail(mockReservation, 'test'),
        generateCustomMessageEmail(mockReservation, 'test'),
        generateNewUserNotificationEmail(mockUser),
        generateAccountApprovedEmail(mockUser),
        generateAccountDeniedEmail(mockUser),
        generateAccountRevokedEmail(mockUser)
      ]

      emails.forEach(email => {
        expect(email.html).toContain('<meta charset="utf-8">')
        expect(email.html).toContain('<meta name="viewport"')
        expect(email.html).toContain('</html>')
      })
    })

    it('all HTML emails have styled body containers', () => {
      const emails = [
        generatePreArrivalEmail(mockReservation, '1234', 'wifi'),
        generatePostCheckoutEmail(mockReservation),
        generateDenialEmail(mockReservation, 'test'),
        generateCancellationEmail(mockReservation, 'test'),
        generateCustomMessageEmail(mockReservation, 'test'),
        generateNewUserNotificationEmail(mockUser),
        generateAccountApprovedEmail(mockUser),
        generateAccountDeniedEmail(mockUser),
        generateAccountRevokedEmail(mockUser)
      ]

      emails.forEach(email => {
        expect(email.html).toContain('font-family')
        expect(email.html).toContain('background')
        expect(email.html).toContain('<body')
      })
    })

    it('pre-arrival email contains access information styling', () => {
      const result = generatePreArrivalEmail(mockReservation, '1234', 'wifi')
      
      expect(result.html).toContain('Access Information')
      expect(result.html).toContain('Door Code: 1234')
      expect(result.html).toContain('WiFi: wifi')
      expect(result.html).toContain('🌲')
    })

    it('post-checkout email contains feedback link styling', () => {
      const result = generatePostCheckoutEmail(mockReservation, 'https://test.com')
      
      expect(result.html).toContain('Share Your Feedback')
      expect(result.html).toContain('https://test.com/feedback/res-123')
      expect(result.html).toContain('<a href=')
    })

    it('denial email contains apologetic messaging', () => {
      const result = generateDenialEmail(mockReservation, 'Dates unavailable')
      
      expect(result.html).toContain('Reservation Update')
      expect(result.html).toContain('Dates unavailable')
      expect(result.html).toContain('We hope to host you in the future')
    })

    it('cancellation email contains cancellation header', () => {
      const result = generateCancellationEmail(mockReservation, 'Emergency maintenance')
      
      expect(result.html).toContain('Reservation Cancelled')
      expect(result.html).toContain('Emergency maintenance')
      expect(result.html).toContain('We apologize')
    })

    it('custom message email wraps message properly', () => {
      const message = 'Your early check-in has been approved!'
      const result = generateCustomMessageEmail(mockReservation, message)
      
      expect(result.html).toContain('Message from The Druids Den')
      expect(result.html).toContain(message)
      expect(result.html).toContain('white-space: pre-wrap')
    })

    it('guest account emails use the expected headings', () => {
      expect(generateNewUserNotificationEmail(mockUser).html).toContain('Guest Approval Needed')
      expect(generateAccountApprovedEmail(mockUser).html).toContain("You're approved")
      expect(generateAccountDeniedEmail(mockUser).html).toContain('Guest account update')
      expect(generateAccountRevokedEmail(mockUser).html).toContain('Reservation access update')
    })

    // Snapshot tests specifically for HTML template structure
    // These ensure template literals are properly formatted and don't break during refactoring
    describe('HTML template snapshots', () => {
      it('pre-arrival HTML structure matches snapshot', () => {
        const result = generatePreArrivalEmail(mockReservation, 'CODE123', 'WiFiPass')
        expect(result.html).toMatchSnapshot()
      })

      it('post-checkout HTML structure matches snapshot', () => {
        const result = generatePostCheckoutEmail(mockReservation)
        expect(result.html).toMatchSnapshot()
      })

      it('denial HTML structure matches snapshot', () => {
        const result = generateDenialEmail(mockReservation, 'Test reason')
        expect(result.html).toMatchSnapshot()
      })

      it('cancellation HTML structure matches snapshot', () => {
        const result = generateCancellationEmail(mockReservation, 'Test reason')
        expect(result.html).toMatchSnapshot()
      })

      it('custom message HTML structure matches snapshot', () => {
        const result = generateCustomMessageEmail(mockReservation, 'Test message')
        expect(result.html).toMatchSnapshot()
      })

      it('new user notification HTML structure matches snapshot', () => {
        const result = generateNewUserNotificationEmail(mockUser)
        expect(result.html).toMatchSnapshot()
      })

      it('account approved HTML structure matches snapshot', () => {
        const result = generateAccountApprovedEmail(mockUser)
        expect(result.html).toMatchSnapshot()
      })

      it('account denied HTML structure matches snapshot', () => {
        const result = generateAccountDeniedEmail(mockUser)
        expect(result.html).toMatchSnapshot()
      })

      it('account revoked HTML structure matches snapshot', () => {
        const result = generateAccountRevokedEmail(mockUser)
        expect(result.html).toMatchSnapshot()
      })
    })
  })

  describe('generateReservationModificationEmail', () => {
    it('generates email with date changes', () => {
      const changes = { dates: true, guests: false }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('html')
      expect(result.text).toContain('New Dates')
      // Date conversion depends on timezone, just check date structure
      expect(result.text).toMatch(/\w+ \d+, 2026 to \w+ \d+, 2026/)
      expect(result.html).toContain('New Dates')
    })

    it('generates email with guest count changes', () => {
      const resWithChildren = { ...mockReservation, children: 2 }
      const changes = { dates: false, guests: true }
      const result = generateReservationModificationEmail(resWithChildren, changes)

      expect(result.text).toContain('Guests')
      expect(result.text).toContain('2 adult(s)')
      expect(result.text).toContain('2 child(ren)')
      expect(result.html).toContain('2 adult(s)')
      expect(result.html).toContain('2 child(ren)')
    })

    it('generates email with both dates and guests changed', () => {
      const changes = { dates: true, guests: true }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result.text).toContain('New Dates')
      expect(result.text).toContain('Guests')
      expect(result.html).toContain('New Dates')
      expect(result.html).toContain('Guests')
    })

    it('includes note when provided in changes', () => {
      const changes = { dates: true, note: 'Please arrive by 5 PM' }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result.text).toContain('Note: Please arrive by 5 PM')
      expect(result.html).toContain('Please arrive by 5 PM')
    })

    it('handles reservation with no children correctly', () => {
      const changes = { guests: true }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result.text).toContain('2 adult(s)')
      expect(result.text).not.toContain('child')
    })

    it('omits note section when no note provided', () => {
      const changes = { dates: true }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result.text).not.toContain('Note:')
    })

    it('handles only guest changes without dates', () => {
      const changes = { guests: true }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result.text).not.toContain('New Dates')
      expect(result.text).toContain('Guests')
    })

    it('uses yellow/warning styling in HTML', () => {
      const changes = { dates: true }
      const result = generateReservationModificationEmail(mockReservation, changes)

      expect(result.html).toContain('212, 185, 66') // RGB for yellow
    })
  })

  describe('Email format consistency', () => {
    it('all emails have text and HTML versions', () => {
      const emails = [
        generatePreArrivalEmail(mockReservation, '1234', 'wifi'),
        generatePostCheckoutEmail(mockReservation),
        generateDenialEmail(mockReservation, 'test'),
        generateCancellationEmail(mockReservation, 'test'),
        generateReservationModificationEmail(mockReservation, { dates: true }),
        generateCustomMessageEmail(mockReservation, 'test'),
        generateNewUserNotificationEmail(mockUser),
        generateAccountApprovedEmail(mockUser),
        generateAccountDeniedEmail(mockUser),
        generateAccountRevokedEmail(mockUser)
      ]

      emails.forEach(email => {
        expect(email.text).toBeTruthy()
        expect(email.html).toBeTruthy()
        expect(email.text.length).toBeGreaterThan(0)
        expect(email.html.length).toBeGreaterThan(0)
      })
    })

    it('all HTML emails contain proper DOCTYPE', () => {
      const emails = [
        generatePreArrivalEmail(mockReservation, '1234', 'wifi'),
        generatePostCheckoutEmail(mockReservation),
        generateDenialEmail(mockReservation, 'test'),
        generateCancellationEmail(mockReservation, 'test'),
        generateReservationModificationEmail(mockReservation, { dates: true }),
        generateCustomMessageEmail(mockReservation, 'test'),
        generateNewUserNotificationEmail(mockUser),
        generateAccountApprovedEmail(mockUser),
        generateAccountDeniedEmail(mockUser),
        generateAccountRevokedEmail(mockUser)
      ]

      emails.forEach(email => {
        expect(email.html).toContain('<!DOCTYPE html>')
      })
    })

    it('all emails include property name in subject or body', () => {
      const emails = [
        generatePreArrivalEmail(mockReservation, '1234', 'wifi'),
        generatePostCheckoutEmail(mockReservation),
        generateDenialEmail(mockReservation, 'test'),
        generateCancellationEmail(mockReservation, 'test'),
        generateReservationModificationEmail(mockReservation, { dates: true }),
        generateCustomMessageEmail(mockReservation, 'test'),
        generateNewUserNotificationEmail(mockUser),
        generateAccountApprovedEmail(mockUser),
        generateAccountDeniedEmail(mockUser),
        generateAccountRevokedEmail(mockUser)
      ]

      emails.forEach(email => {
        // Property branding appears as the property name or branded site URL
        const combined = email.subject.toLowerCase() + email.text.toLowerCase()
        expect(combined).toMatch(/druid'?s den|druidsdenwi\.com/)
      })
    })
  })
})
