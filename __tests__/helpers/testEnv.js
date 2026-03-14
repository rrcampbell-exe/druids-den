import { beforeEach, afterEach, vi } from 'vitest'

export function setupTestEnv(defaultEnv = {}) {
  beforeEach(() => {
    for (const [key, value] of Object.entries(defaultEnv)) {
      vi.stubEnv(key, value)
    }
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })
}
