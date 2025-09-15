import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './tests/__mocks__/server'

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Clean up after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Close server after all tests
afterAll(() => server.close())

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock Canvas for image optimization tests
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
}))

global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob(['fake-image'], { type: 'image/png' })
  callback(blob)
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock fetch
global.fetch = vi.fn()

// Mock Socket.IO
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
}))