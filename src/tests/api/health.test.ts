import { describe, it, expect } from 'vitest'

describe('/api/health', () => {
  it('should return health status', async () => {
    const response = await fetch('/api/health')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('version')
  })

  it('should return valid timestamp format', async () => {
    const response = await fetch('/api/health')
    const data = await response.json()
    
    const timestamp = new Date(data.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.toString()).not.toBe('Invalid Date')
  })
})