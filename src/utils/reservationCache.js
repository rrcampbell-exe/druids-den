/**
 * Simple in-memory cache for reservation data
 * Used only in the owner dashboard to reduce unnecessary DB calls
 * Guest-facing pages should NOT use this cache
 */

const cache = {
  reservations: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
  }
}

export const reservationCache = {
  /**
   * Check if cached data is still valid
   */
  isValid() {
    const cached = cache.reservations
    if (!cached.data || !cached.timestamp) return false
    return Date.now() - cached.timestamp < cached.ttl
  },

  /**
   * Get cached reservations data
   */
  get() {
    if (this.isValid()) {
      return cache.reservations.data
    }
    return null
  },

  /**
   * Set cached reservations data
   */
  set(data) {
    cache.reservations = {
      data,
      timestamp: Date.now(),
      ttl: cache.reservations.ttl
    }
  },

  /**
   * Clear the cache (use after mutations)
   */
  invalidate() {
    cache.reservations = {
      data: null,
      timestamp: null,
      ttl: cache.reservations.ttl
    }
  },

  /**
   * Fetch reservations with caching
   * @param {boolean} forceRefresh - Skip cache and fetch fresh data
   */
  async fetch(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.get()
      if (cached) {
        return cached
      }
    }

    // Fetch from API
    const response = await fetch('/api/reservations')
    if (!response.ok) {
      throw new Error('Failed to fetch reservations')
    }

    const data = await response.json()
    const reservations = data.reservations || []

    // Cache the result
    this.set(reservations)

    return reservations
  }
}
