import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }

  return redis
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}

// Rate limiting using Redis
export interface RateLimitConfig {
  key: string
  limit: number
  window: number // in seconds
}

export async function rateLimit(config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedisClient()
  const { key, limit, window } = config

  try {
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, window)
    }

    const remaining = Math.max(0, limit - current)
    const allowed = current <= limit

    return { allowed, remaining }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if Redis is unavailable
    return { allowed: true, remaining: limit }
  }
}

// Request queue using Redis
export interface QueueConfig {
  key: string
  maxConcurrent: number
  timeout: number // in seconds
}

export async function acquireQueueSlot(config: QueueConfig): Promise<boolean> {
  const redis = getRedisClient()
  const { key, maxConcurrent, timeout } = config

  try {
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, timeout + 10)
    }

    if (current > maxConcurrent) {
      await redis.decr(key)
      return false
    }

    return true
  } catch (error) {
    console.error('Queue slot acquisition error:', error)
    // Fail open - allow request if Redis is unavailable
    return true
  }
}

export async function releaseQueueSlot(key: string): Promise<void> {
  const redis = getRedisClient()
  
  try {
    await redis.decr(key)
  } catch (error) {
    console.error('Queue slot release error:', error)
  }
}
