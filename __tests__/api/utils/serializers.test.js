import { describe, it, expect, vi } from 'vitest'

const calculateEstimatedTotalMock = vi.fn()

vi.mock('../../../api/_utils/pricing.js', () => ({
  calculateEstimatedTotal: (...args) => calculateEstimatedTotalMock(...args),
}))

import { serializeReservation, serializeUser } from '../../../api/_utils/serializers.js'

describe('serializers', () => {
  describe('serializeReservation', () => {
    it('serializes reservation dates, status, and pricing fields', () => {
      calculateEstimatedTotalMock.mockReturnValue(642)

      const reservation = {
        id: 'res-123',
        guestFirstName: 'Rowan',
        guestLastName: 'Oak',
        guestEmail: 'rowan@example.com',
        guestPhone: '555-111-2222',
        checkIn: new Date('2026-04-10T12:00:00.000Z'),
        checkOut: new Date('2026-04-13T12:00:00.000Z'),
        adults: 2,
        children: 1,
        specialRequests: 'Late arrival',
        status: 'APPROVED',
        isOwnerReservation: true,
        submittedAt: new Date('2026-02-01T08:30:00.000Z'),
        statusChangedAt: new Date('2026-02-02T09:45:00.000Z'),
        ownerNotes: 'Leave welcome basket',
        denialMessage: null,
        cancellationMessage: null,
        userId: 'user-123',
      }

      expect(serializeReservation(reservation)).toEqual({
        id: 'res-123',
        firstName: 'Rowan',
        lastName: 'Oak',
        email: 'rowan@example.com',
        phone: '555-111-2222',
        checkIn: '2026-04-10',
        checkOut: '2026-04-13',
        adults: 2,
        children: 1,
        specialRequests: 'Late arrival',
        status: 'approved',
        isOwnerReservation: true,
        submittedAt: '2026-02-01T08:30:00.000Z',
        statusChangedAt: '2026-02-02T09:45:00.000Z',
        approvedAt: '2026-02-02T09:45:00.000Z',
        estimatedTotal: 642,
        ownerNote: 'Leave welcome basket',
        denialMessage: null,
        cancellationMessage: null,
        userId: 'user-123',
      })

      expect(calculateEstimatedTotalMock).toHaveBeenCalledWith('2026-04-10', '2026-04-13')
    })

    it('returns null for optional fields when reservation is not approved or owner-linked', () => {
      calculateEstimatedTotalMock.mockReturnValue(318)

      const reservation = {
        id: 'res-456',
        guestFirstName: 'Ash',
        guestLastName: 'Pine',
        guestEmail: 'ash@example.com',
        guestPhone: '555-333-4444',
        checkIn: new Date('2026-05-01T00:00:00.000Z'),
        checkOut: new Date('2026-05-03T00:00:00.000Z'),
        adults: 4,
        children: 0,
        specialRequests: '',
        status: 'PENDING',
        isOwnerReservation: false,
        submittedAt: null,
        statusChangedAt: null,
        ownerNotes: 'Internal note',
        denialMessage: 'Need approval',
        cancellationMessage: 'Cancelled due to weather',
        userId: null,
      }

      expect(serializeReservation(reservation)).toEqual({
        id: 'res-456',
        firstName: 'Ash',
        lastName: 'Pine',
        email: 'ash@example.com',
        phone: '555-333-4444',
        checkIn: '2026-05-01',
        checkOut: '2026-05-03',
        adults: 4,
        children: 0,
        specialRequests: '',
        status: 'pending',
        isOwnerReservation: false,
        submittedAt: null,
        statusChangedAt: null,
        approvedAt: null,
        estimatedTotal: 318,
        ownerNote: null,
        denialMessage: 'Need approval',
        cancellationMessage: 'Cancelled due to weather',
        userId: null,
      })
    })
  })

  describe('serializeUser', () => {
    it('serializes all user fields including account status metadata', () => {
      const user = {
        id: 'user-1',
        clerkId: 'clerk_123',
        email: 'guest@example.com',
        firstName: 'Willow',
        lastName: 'Reed',
        phone: '555-000-1111',
        role: 'GUEST',
        accountStatus: 'APPROVED',
        accountStatusChangedAt: new Date('2026-03-10T14:15:00.000Z'),
        accountStatusChangedBy: 'owner-1',
        marketingOptIn: true,
        preferredContactMethod: 'EMAIL',
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
        updatedAt: new Date('2026-03-12T16:20:00.000Z'),
      }

      expect(serializeUser(user)).toEqual({
        id: 'user-1',
        clerkId: 'clerk_123',
        email: 'guest@example.com',
        firstName: 'Willow',
        lastName: 'Reed',
        phone: '555-000-1111',
        role: 'GUEST',
        accountStatus: 'APPROVED',
        accountStatusChangedAt: '2026-03-10T14:15:00.000Z',
        accountStatusChangedBy: 'owner-1',
        marketingOptIn: true,
        preferredContactMethod: 'EMAIL',
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-12T16:20:00.000Z',
      })
    })

    it('returns null for optional date fields when they are absent', () => {
      const user = {
        id: 'user-2',
        clerkId: 'clerk_456',
        email: 'pending@example.com',
        firstName: 'Fern',
        lastName: null,
        phone: null,
        role: 'GUEST',
        accountStatus: 'PENDING',
        accountStatusChangedAt: null,
        accountStatusChangedBy: null,
        marketingOptIn: false,
        preferredContactMethod: 'TEXT',
        createdAt: null,
        updatedAt: null,
      }

      expect(serializeUser(user)).toEqual({
        id: 'user-2',
        clerkId: 'clerk_456',
        email: 'pending@example.com',
        firstName: 'Fern',
        lastName: null,
        phone: null,
        role: 'GUEST',
        accountStatus: 'PENDING',
        accountStatusChangedAt: null,
        accountStatusChangedBy: null,
        marketingOptIn: false,
        preferredContactMethod: 'TEXT',
        createdAt: null,
        updatedAt: null,
      })
    })
  })
})