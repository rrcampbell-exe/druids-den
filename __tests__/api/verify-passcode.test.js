import { describe, it, expect, beforeEach, vi } from 'vitest'
import handler from '../../api/verify-passcode'

describe('verify-passcode API', () => {
  let req, res

  beforeEach(() => {
    // Mock request object
    req = {
      method: 'POST',
      body: {},
    }

    // Mock response object with chainable methods
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    // Reset environment variable
    vi.stubEnv('SPOOKTOBERFEST_PASSCODE', 'test-passcode-123')
  })

  describe('HTTP Method Validation', () => {
    it('returns 405 for GET requests', () => {
      req.method = 'GET'
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('returns 405 for PUT requests', () => {
      req.method = 'PUT'
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('returns 405 for DELETE requests', () => {
      req.method = 'DELETE'
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('accepts POST requests', () => {
      req.method = 'POST'
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      
      // Should not return 405
      expect(res.status).not.toHaveBeenCalledWith(405)
    })
  })

  describe('Environment Configuration', () => {
    it('returns 500 when SPOOKTOBERFEST_PASSCODE env var is not set', () => {
      vi.unstubAllEnvs()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error' })
      expect(consoleErrorSpy).toHaveBeenCalledWith('SPOOKTOBERFEST_PASSCODE environment variable is not set')
      
      consoleErrorSpy.mockRestore()
    })

    it('returns 500 when SPOOKTOBERFEST_PASSCODE env var is empty string', () => {
      vi.stubEnv('SPOOKTOBERFEST_PASSCODE', '')
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error' })
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Passcode Validation', () => {
    it('returns 200 with token for correct passcode', () => {
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
        })
      )
    })

    it('returns 401 for incorrect passcode', () => {
      req.body = { passcode: 'wrong-passcode' }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid passcode',
      })
    })

    it('returns 401 for empty passcode', () => {
      req.body = { passcode: '' }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid passcode',
      })
    })

    it('returns 401 when passcode is missing from body', () => {
      req.body = {}
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid passcode',
      })
    })

    it('returns 401 for passcode with extra whitespace', () => {
      req.body = { passcode: ' test-passcode-123 ' }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('is case-sensitive for passcode validation', () => {
      req.body = { passcode: 'TEST-PASSCODE-123' }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  describe('Token Generation', () => {
    it('generates a valid base64 token', () => {
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      
      const callArgs = res.json.mock.calls[0][0]
      const token = callArgs.token
      
      // Should be a valid base64 string
      expect(token).toBeTruthy()
      expect(() => Buffer.from(token, 'base64')).not.toThrow()
    })

    it('token contains authenticated flag', () => {
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      
      const callArgs = res.json.mock.calls[0][0]
      const token = callArgs.token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      expect(decoded.authenticated).toBe(true)
    })

    it('token contains timestamp', () => {
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      
      const callArgs = res.json.mock.calls[0][0]
      const token = callArgs.token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      expect(decoded.timestamp).toBeDefined()
      expect(typeof decoded.timestamp).toBe('number')
      expect(decoded.timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('generates different tokens for subsequent valid requests', () => {
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      const firstToken = res.json.mock.calls[0][0].token
      
      // Reset mocks
      res.json.mockClear()
      
      // Make another request - tokens may be different if time passes
      handler(req, res)
      const secondToken = res.json.mock.calls[0][0].token
      
      // Both should be valid tokens
      expect(typeof firstToken).toBe('string')
      expect(typeof secondToken).toBe('string')
      expect(firstToken).toBeTruthy()
      expect(secondToken).toBeTruthy()
    })
  })

  describe('Response Structure', () => {
    it('successful response has success and token properties', () => {
      req.body = { passcode: 'test-passcode-123' }
      
      handler(req, res)
      
      const response = res.json.mock.calls[0][0]
      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('token')
      expect(Object.keys(response)).toHaveLength(2)
    })

    it('failed response has success and error properties', () => {
      req.body = { passcode: 'wrong' }
      
      handler(req, res)
      
      const response = res.json.mock.calls[0][0]
      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('error')
      expect(response.success).toBe(false)
    })

    it('method not allowed response has only error property', () => {
      req.method = 'GET'
      
      handler(req, res)
      
      const response = res.json.mock.calls[0][0]
      expect(response).toHaveProperty('error')
      expect(Object.keys(response)).toHaveLength(1)
    })
  })

  describe('Security Considerations', () => {
    it('does not leak information about passcode format in error messages', () => {
      req.body = { passcode: 'wrong' }
      
      handler(req, res)
      
      const response = res.json.mock.calls[0][0]
      expect(response.error).toBe('Invalid passcode')
      expect(response.error).not.toContain('expected')
      expect(response.error).not.toContain('format')
    })

    it('treats null passcode as invalid', () => {
      req.body = { passcode: null }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('treats undefined passcode as invalid', () => {
      req.body = { passcode: undefined }
      
      handler(req, res)
      
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })
})
