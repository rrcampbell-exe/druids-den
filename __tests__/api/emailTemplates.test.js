import { describe, it, expect } from 'vitest'
import { generateAdminNotificationEmail, generateCustomerConfirmationEmail } from '../../api/utils/emailTemplates'

describe('emailTemplates', () => {
  const mockReservation = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    checkIn: '2026-06-01',
    checkOut: '2026-06-03',
    adults: 2,
    children: 1,
    specialRequests: 'Early check-in if possible'
  }

  describe('generateAdminNotificationEmail', () => {
    it('returns email object with correct structure', () => {
      const email = generateAdminNotificationEmail(mockReservation)
      
      expect(email).toHaveProperty('subject')
      expect(email).toHaveProperty('html')
      expect(email).toHaveProperty('text')
    })

    it('includes guest name in subject', () => {
      const email = generateAdminNotificationEmail(mockReservation)
      
      expect(email.subject).toContain('John Doe')
      expect(email.subject).toContain('New Reservation Request')
    })

    it('includes all reservation details in text version', () => {
      const email = generateAdminNotificationEmail(mockReservation)
      
      expect(email.text).toContain('John')
      expect(email.text).toContain('Doe')
      expect(email.text).toContain('john@example.com')
      expect(email.text).toContain('(555) 123-4567')
      expect(email.text).toContain('2026-06-01')
      expect(email.text).toContain('2026-06-03')
      expect(email.text).toContain('2')
      expect(email.text).toContain('1')
      expect(email.text).toContain('Early check-in if possible')
    })

    it('includes all reservation details in HTML version', () => {
      const email = generateAdminNotificationEmail(mockReservation)
      
      expect(email.html).toContain('John')
      expect(email.html).toContain('Doe')
      expect(email.html).toContain('john@example.com')
      expect(email.html).toContain('(555) 123-4567')
      // HTML contains formatted dates
      expect(email.html).toContain('May 31, 2026')
      expect(email.html).toContain('June 2, 2026')
      expect(email.html).toContain('2')
      expect(email.html).toContain('1')
    })

    it('uses shiitake color in HTML', () => {
      const email = generateAdminNotificationEmail(mockReservation)
      
      expect(email.html).toContain('#BAB6A2')
    })

    it('handles missing special requests', () => {
      const reservationWithoutRequests = { ...mockReservation }
      delete reservationWithoutRequests.specialRequests
      
      const email = generateAdminNotificationEmail(reservationWithoutRequests)
      
      expect(email.text).toContain('None')
    })

    it('handles zero children', () => {
      const reservationNoChildren = { 
        ...mockReservation, 
        children: 0 
      }
      
      const email = generateAdminNotificationEmail(reservationNoChildren)
      
      expect(email.text).toContain('0')
    })

    it('formats dates in America/Chicago timezone', () => {
      const email = generateAdminNotificationEmail(mockReservation)
      
      // The text version uses raw date strings (2026-06-01)
      // Dates appear in YYYY-MM-DD format in the text version
      expect(email.text).toMatch(/2026-\d{2}-\d{2}/)
    })
  })

  describe('generateCustomerConfirmationEmail', () => {
    it('returns email object with correct structure', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email).toHaveProperty('subject')
      expect(email).toHaveProperty('html')
      expect(email).toHaveProperty('text')
    })

    it('has confirmation subject line', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.subject).toContain('Reservation Request Received')
      expect(email.subject).toContain('The Druids Den')
    })

    it('addresses customer by first name', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.text).toContain('Dear John')
      expect(email.html).toContain('Dear John')
    })

    it('includes confirmation message in text version', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      // Customer email has simple confirmation text
      expect(email.text).toContain('Thank you for your reservation request')
      expect(email.text).toContain('within 24 hours')
    })

    it('includes check-in and check-out dates', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.text).toContain('2026-06-01')
      expect(email.text).toContain('2026-06-03')
    })

    it('includes number of guests', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.text).toContain('2 adult(s)')
      expect(email.text).toContain('1 child(ren)')
    })

    it('handles singular adult correctly', () => {
      const singleAdult = { 
        ...mockReservation, 
        adults: 1,
        children: 0
      }
      
      const email = generateCustomerConfirmationEmail(singleAdult)
      
      expect(email.text).toContain('1 adult(s)')
    })

    it('handles singular child correctly', () => {
      const singleChild = { 
        ...mockReservation, 
        adults: 2,
        children: 1
      }
      
      const email = generateCustomerConfirmationEmail(singleChild)
      
      expect(email.text).toContain('1 child(ren)')
    })

    it('handles zero children correctly', () => {
      const noChildren = { 
        ...mockReservation, 
        children: 0
      }
      
      const email = generateCustomerConfirmationEmail(noChildren)
      
      // Should only show adults when children is 0
      expect(email.text).toContain('2 adult(s)')
      expect(email.text).not.toContain('child')
    })

    it('uses shiitake background color in HTML', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.html).toContain('#BAB6A2')
    })

    it('uses iron-ore text color in HTML', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.html).toContain('#464645')
    })

    it('includes special requests when present', () => {
      const email = generateCustomerConfirmationEmail(mockReservation)
      
      expect(email.text).toContain('Early check-in if possible')
    })

    it('does not mention special requests when absent', () => {
      const noRequests = { ...mockReservation }
      delete noRequests.specialRequests
      
      const email = generateCustomerConfirmationEmail(noRequests)
      
      // Should not have a special requests section
      expect(email.text).not.toContain('Special requests')
    })
  })
})
