import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from './redis'

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  // Strict limits for mutation endpoints
  MUTATION: { limit: 10, window: 60 }, // 10 requests per minute
  
  // Moderate limits for read endpoints
  READ: { limit: 30, window: 60 }, // 30 requests per minute
  
  // Lenient limits for auth endpoints
  AUTH: { limit: 5, window: 60 }, // 5 requests per minute
  
  // High limits for admin endpoints
  ADMIN: { limit: 20, window: 60 }, // 20 requests per minute
}

export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS
): Promise<NextResponse | null> {
  // Skip rate limiting if Redis is not configured
  if (!process.env.REDIS_URL) {
    return null
  }

  // Create a unique key based on IP and endpoint
  const ip = request.ip || 'unknown'
  const pathname = new URL(request.url).pathname
  const key = `rate_limit:${type}:${ip}:${pathname}`

  const config = RATE_LIMITS[type]
  const result = await rateLimit({ key, ...config })

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: config.window },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + config.window).toString(),
        }
      }
    )
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.json({})
  response.headers.set('X-RateLimit-Limit', config.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  
  return null // null means request is allowed
}

// Middleware wrapper for API routes
export function withRateLimit(type: keyof typeof RATE_LIMITS) {
  return async (request: NextRequest) => {
    const rateLimitResponse = await applyRateLimit(request, type)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return null // Continue to the actual handler
  }
}
