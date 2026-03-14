/**
 * Simple in-memory cache for reservation data
 * Used only in the owner dashboard to reduce unnecessary DB calls
 * Guest-facing pages should NOT use this cache
 */

const cache = {
  reservations: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000, // 5 minutes
    inFlight: null // Track in-flight fetch promise for deduplication
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
      ttl: cache.reservations.ttl,
      inFlight: null
    }
  },

  /**
   * Fetch reservations with caching and request deduplication
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

    // If there's already an in-flight request, wait for it instead of making a new one
    if (cache.reservations.inFlight) {
      return cache.reservations.inFlight
    }

    // Create the fetch promise and store it
    const fetchPromise = (async () => {
      try {
        const response = await fetch('/api/reservations')
        if (!response.ok) {
          throw new Error('Failed to fetch reservations')
        }

        const data = await response.json()
        const reservations = data.reservations || []

        // Cache the result
        this.set(reservations)

        return reservations
      } finally {
        // Clear the in-flight promise after it resolves or rejects
        cache.reservations.inFlight = null
      }
    })()

    // Store the in-flight promise
    cache.reservations.inFlight = fetchPromise

    return fetchPromise
  }
}
