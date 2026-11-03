import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const loadBookingLinks = async () => {
  vi.resetModules()
  return import('../../src/config/booking')
}
const viteConfigSource = readFileSync(join(process.cwd(), 'vite.config.js'), 'utf8')

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('booking link configuration', () => {
  it('only exposes explicitly approved client environment variables', () => {
    const configuredPrefixes = viteConfigSource.match(/envPrefix:\s*\[([\s\S]*?)\]/)?.[1]
      ?.match(/'([^']+)'/g)
      ?.map((prefix) => prefix.slice(1, -1))

    expect(configuredPrefixes).toEqual([
      'VITE_AIRBNB_BOOKING_URL',
      'VITE_VRBO_BOOKING_URL',
      'VITE_WEATHER_API_KEY',
    ])
  })

  it('keeps booking actions unavailable when no listing URLs are configured', async () => {
    vi.stubEnv('VITE_AIRBNB_BOOKING_URL', '')
    vi.stubEnv('VITE_VRBO_BOOKING_URL', '')

    const { bookingLinks } = await loadBookingLinks()

    expect(bookingLinks).toEqual([])
  })

  it('accepts verified Airbnb and Vrbo HTTPS hosts', async () => {
    vi.stubEnv('VITE_AIRBNB_BOOKING_URL', 'https://www.airbnb.com/rooms/123')
    vi.stubEnv('VITE_VRBO_BOOKING_URL', 'https://vrbo.com/123')

    const { bookingLinks } = await loadBookingLinks()

    expect(bookingLinks).toEqual([
      { platform: 'Airbnb', href: 'https://www.airbnb.com/rooms/123' },
      { platform: 'Vrbo', href: 'https://vrbo.com/123' },
    ])
  })

  it.each([
    ['http://airbnb.com/rooms/123', 'HTTPS'],
    ['https://example.com/rooms/123', 'Airbnb'],
    ['https://user:pass@airbnb.com/rooms/123', 'Airbnb'],
  ])('rejects an invalid Airbnb URL: %s', async (value, message) => {
    vi.stubEnv('VITE_AIRBNB_BOOKING_URL', value)
    vi.stubEnv('VITE_VRBO_BOOKING_URL', '')

    await expect(loadBookingLinks()).rejects.toThrow(message)
  })
})
