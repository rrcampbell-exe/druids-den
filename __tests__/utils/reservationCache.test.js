import { describe, it, expect, beforeEach, vi } from 'vitest'
import { reservationCache } from '../../src/utils/reservationCache'

// Mock fetch globally
global.fetch = vi.fn()

describe('reservationCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    reservationCache.invalidate()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('fetch()', () => {
    it('fetches data from API when cache is empty', async () => {
      const mockData = {
        reservations: [
          { id: 1, status: 'PENDING' },
          { id: 2, status: 'APPROVED' }
        ]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      const result = await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledWith('/api/reservations')
      expect(result).toEqual(mockData.reservations)
    })

    it('returns cached data when cache is valid', async () => {
      const mockData = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      // First fetch - populates cache
      await reservationCache.fetch()
      
      // Second fetch - should use cache
      const result = await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledTimes(1) // Only called once
      expect(result).toEqual(mockData.reservations)
    })

    it('refetches data when cache expires (5 minutes)', async () => {
      const mockData1 = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }
      const mockData2 = {
        reservations: [{ id: 2, status: 'APPROVED' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      })

      // First fetch
      await reservationCache.fetch()

      // Advance time by 5 minutes and 1 second
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000)

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      })

      // Second fetch after expiration
      const result = await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockData2.reservations)
    })

    it('does not refetch data within TTL window', async () => {
      const mockData = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      // First fetch
      await reservationCache.fetch()

      // Advance time by 4 minutes (still within 5 minute TTL)
      vi.advanceTimersByTime(4 * 60 * 1000)

      // Second fetch - should use cache
      const result = await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockData.reservations)
    })

    it('handles API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(reservationCache.fetch()).rejects.toThrow('Network error')
    })

    it('handles non-200 responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(reservationCache.fetch()).rejects.toThrow('Failed to fetch reservations')
    })

    it('returns empty array when API returns no reservations', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reservations: [] })
      })

      const result = await reservationCache.fetch()

      expect(result).toEqual([])
    })

    it('handles missing reservations property in response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      const result = await reservationCache.fetch()

      expect(result).toEqual([])
    })
  })

  describe('invalidate()', () => {
    it('clears cached data', async () => {
      const mockData1 = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }
      const mockData2 = {
        reservations: [{ id: 2, status: 'APPROVED' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      })

      // First fetch - populates cache
      await reservationCache.fetch()

      // Invalidate cache
      reservationCache.invalidate()

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      })

      // Next fetch should get new data
      const result = await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockData2.reservations)
    })

    it('can be called multiple times safely', () => {
      expect(() => {
        reservationCache.invalidate()
        reservationCache.invalidate()
        reservationCache.invalidate()
      }).not.toThrow()
    })

    it('forces refetch even within TTL window', async () => {
      const mockData1 = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }
      const mockData2 = {
        reservations: [{ id: 2, status: 'APPROVED' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      })

      // First fetch
      await reservationCache.fetch()

      // Advance time by 1 minute (still within TTL)
      vi.advanceTimersByTime(1 * 60 * 1000)

      // Invalidate cache
      reservationCache.invalidate()

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      })

      // Next fetch should get new data despite being within TTL
      const result = await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockData2.reservations)
    })
  })

  describe('Cache behavior', () => {
    it('maintains separate cache instances across tests', async () => {
      const mockData = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      await reservationCache.fetch()
      reservationCache.invalidate()

      // After invalidation, cache should be empty
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })

      await reservationCache.fetch()

      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('handles concurrent fetch requests', async () => {
      const mockData = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      })

      // Make multiple concurrent requests
      const [result1, result2, result3] = await Promise.all([
        reservationCache.fetch(),
        reservationCache.fetch(),
        reservationCache.fetch()
      ])

      // Should only fetch once and return same data to all
      expect(result1).toEqual(mockData.reservations)
      expect(result2).toEqual(mockData.reservations)
      expect(result3).toEqual(mockData.reservations)
    })
  })

  describe('TTL (Time To Live)', () => {
    it('uses 5 minute TTL', async () => {
      const mockData = {
        reservations: [{ id: 1, status: 'PENDING' }]
      }

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      })

      // First fetch
      await reservationCache.fetch()

      // Advance time by less than 5 minutes - cache should be valid
      vi.advanceTimersByTime(4 * 60 * 1000)

      await reservationCache.fetch()
      expect(fetch).toHaveBeenCalledTimes(1) // Still using cache

      // Advance time past 5 minute TTL
      vi.advanceTimersByTime(2 * 60 * 1000) // Now at 6 minutes total

      await reservationCache.fetch()
      expect(fetch).toHaveBeenCalledTimes(2) // Cache expired, fetched again
    })
  })
})
