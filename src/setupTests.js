import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

const mockAuth = {
  isLoaded: true,
  isSignedIn: true,
  getToken: vi.fn().mockResolvedValue('test-token'),
  signOut: vi.fn(),
}

const mockUser = {
  firstName: 'Test',
  lastName: 'Owner',
  primaryEmailAddress: {
    emailAddress: 'owner@example.com',
  },
  primaryPhoneNumber: {
    phoneNumber: '(555) 123-4567',
  },
}

vi.mock('@clerk/react', () => ({
  ClerkProvider: ({ children }) => children,
  SignIn: () => 'SignIn',
  SignUp: () => 'SignUp',
  UserButton: () => 'UserButton',
  useAuth: () => mockAuth,
  useUser: () => ({
    isLoaded: true,
    user: mockUser,
  }),
}))

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}))

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => null,
}))

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe(target) {
    // Immediately trigger the callback with a mock entry
    this.callback([
      {
        target,
        isIntersecting: true,
        intersectionRatio: 1,
      },
    ])
  }

  unobserve() {}
  disconnect() {}
}

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock fetch
global.fetch = vi.fn()
