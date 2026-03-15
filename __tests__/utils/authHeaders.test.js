import { describe, it, expect, vi } from 'vitest'
import { buildAuthHeaders } from '../../src/utils/authHeaders'

describe('buildAuthHeaders', () => {
  it('adds a bearer token to existing headers', async () => {
    const getToken = vi.fn().mockResolvedValue('token-123')

    await expect(buildAuthHeaders(getToken, { 'X-Test': 'value' })).resolves.toEqual({
      'X-Test': 'value',
      Authorization: 'Bearer token-123',
    })
  })

  it('returns the original headers when no token is available', async () => {
    const getToken = vi.fn().mockResolvedValue(null)
    const headers = { 'X-Test': 'value' }

    await expect(buildAuthHeaders(getToken, headers)).resolves.toBe(headers)
  })

  it('defaults to an empty header object when none is provided', async () => {
    const getToken = vi.fn().mockResolvedValue('token-456')

    await expect(buildAuthHeaders(getToken)).resolves.toEqual({
      Authorization: 'Bearer token-456',
    })
  })
})