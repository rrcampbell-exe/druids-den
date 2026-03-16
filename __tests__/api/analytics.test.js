import { describe, it, expect, vi, beforeEach } from 'vitest'

const trackMock = vi.hoisted(() => vi.fn())

vi.mock('@vercel/analytics/server', () => ({
  track: trackMock,
}))

import { trackServerEvent } from '../../api/_utils/analytics.js'

describe('analytics utility', () => {
  beforeEach(() => {
    trackMock.mockReset()
  })

  it('does nothing when event name is missing', async () => {
    await trackServerEvent('', { ok: true }, { headers: {} })
    expect(trackMock).not.toHaveBeenCalled()
  })

  it('sanitizes payload and forwards only allowlisted non-sensitive headers', async () => {
    const req = {
      headers: {
        'user-agent': 'vitest-agent',
        Referer: 'https://example.com/path',
        'x-forwarded-for': ['203.0.113.42', 123],
        'accept-language': 'en-US',
        authorization: 'Bearer secret',
        cookie: 'session=secret',
        'x-custom-debug': 'drop-me',
      },
    }

    await trackServerEvent(
      'reservation_api_created',
      {
        count: 2,
        ok: true,
        note: 'test',
        nested: { ignored: true },
        list: ['ignored'],
        missing: undefined,
      },
      req,
    )

    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith(
      'reservation_api_created',
      {
        count: 2,
        ok: true,
        note: 'test',
      },
      {
        request: {
          headers: {
            'accept-language': 'en-US',
            referer: 'https://example.com/path',
            'user-agent': 'vitest-agent',
            'x-forwarded-for': ['203.0.113.42'],
          },
        },
      },
    )
  })
})
