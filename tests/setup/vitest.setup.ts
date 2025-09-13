import { expect, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Provide a robust axios mock with interceptors for tests that import the API client
import { vi } from 'vitest'

vi.mock('axios', () => {
  const createClientMock = () => {
    const client: any = {
      defaults: { baseURL: '', headers: {} },
      interceptors: {
        request: {
          handlers: [] as any[],
          use(fulfilled: any, rejected?: any) {
            this.handlers.push({ fulfilled, rejected })
            return this.handlers.length - 1
          },
        },
        response: {
          handlers: [] as any[],
          use(fulfilled: any, rejected?: any) {
            this.handlers.push({ fulfilled, rejected })
            return this.handlers.length - 1
          },
        },
      },
      request: vi.fn(async (config?: any) => ({ data: {}, config })),
      get: vi.fn(async (url?: any, config?: any) => ({ data: {}, config, url })),
      post: vi.fn(async (url?: any, data?: any, config?: any) => ({ data: {}, config, url })),
      put: vi.fn(async (url?: any, data?: any, config?: any) => ({ data: {}, config, url })),
      delete: vi.fn(async (url?: any, config?: any) => ({ data: {}, config, url })),
    }
    return client
  }

  const client = createClientMock()

  return {
    default: { ...client, create: vi.fn(() => createClientMock()), post: client.post },
  }
})

// Clean up DOM between tests
afterEach(() => {
  cleanup()
})
