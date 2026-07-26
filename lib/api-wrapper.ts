import { NextRequest, NextResponse } from 'next/server'
import { BaseService } from './services/base.service'
import { applyRateLimit, RATE_LIMITS } from './rate-limit'
import { handleValidationError } from './validations'

/**
 * Configuration for API route wrapper
 */
interface ApiHandlerConfig {
  /** Permission required for this endpoint */
  permission?: string
  /** Rate limit type (READ, MUTATION, AUTH, ADMIN) */
  rateLimitType?: keyof typeof RATE_LIMITS
  /** Service instance for error handling */
  service: BaseService
  /** Whether to return user object in handler context */
  requireUser?: boolean
}

/**
 * Context passed to API handlers
 */
interface ApiHandlerContext {
  /** Authenticated user (if permission was required) */
  user?: any
}

/**
 * Type for handler function - supports both regular and dynamic routes
 */
type ApiHandler = (
  request: NextRequest,
  context: ApiHandlerContext,
  ...args: any[]
) => Promise<NextResponse>

/**
 * Wraps an API handler with authentication, authorization, and rate limiting
 * 
 * @param config - Configuration for auth, rate limiting, and error handling
 * @param handler - The actual API handler function
 * @returns Wrapped handler function
 * 
 * @example
 * ```ts
 * export const GET = withApiHandler({
 *   permission: PERMISSIONS.KYC_READ,
 *   rateLimitType: 'READ',
 *   service: kycService
 * }, async (request) => {
 *   // Your handler logic here
 *   return NextResponse.json({ data })
 * })
 * ```
 */
export function withApiHandler(
  config: ApiHandlerConfig,
  handler: ApiHandler
): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      let user: any = undefined

      // Apply authentication and authorization if permission is required
      if (config.permission) {
        user = await config.service.requireAuthAndPermission(config.permission)
      } else if (config.requireUser) {
        user = await config.service.authenticate()
      }

      // Apply rate limiting if rate limit type is specified
      if (config.rateLimitType) {
        const rateLimitResponse = await applyRateLimit(request, config.rateLimitType)
        if (rateLimitResponse) return rateLimitResponse
      }

      // Execute the actual handler with context and all arguments
      return await handler(request, { user }, ...args)
    } catch (error: any) {
      return config.service.handleError(error)
    }
  }
}

/**
 * Convenience wrapper for GET requests (read operations)
 */
export function withGetHandler(
  config: ApiHandlerConfig,
  handler: ApiHandler
): ApiHandler {
  return withApiHandler(
    { ...config, rateLimitType: config.rateLimitType || 'READ' },
    handler
  )
}

/**
 * Convenience wrapper for POST/PUT/DELETE requests (mutation operations)
 */
export function withMutationHandler(
  config: ApiHandlerConfig,
  handler: ApiHandler
): ApiHandler {
  return withApiHandler(
    { ...config, rateLimitType: config.rateLimitType || 'MUTATION' },
    handler
  )
}

/**
 * Helper to parse query parameters safely
 */
export function parseQueryParams(
  request: NextRequest,
  schema: any
): Record<string, any> {
  const { searchParams } = new URL(request.url)
  const params: Record<string, any> = {}
  
  for (const [key, value] of searchParams.entries()) {
    // Try to convert to number if the schema expects a number
    if (value && !isNaN(Number(value))) {
      params[key] = Number(value)
    } else {
      params[key] = value || undefined
    }
  }
  
  return schema.parse(params)
}
