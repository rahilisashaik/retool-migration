import { prisma } from '@/lib/prisma'
import { requireAuth, checkPermission } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'
import { NextResponse } from 'next/server'
import { handleValidationError } from '@/lib/validations'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

/**
 * Base service class providing common functionality for all API services
 * Centralizes authentication, authorization, error handling, and Prisma operations
 */
export abstract class BaseService {
  /**
   * Authenticate the current request and return the user
   */
  public async authenticate() {
    return await requireAuth()
  }

  /**
   * Check if the current user has the required permission
   */
  public async authorize(permission: string): Promise<boolean> {
    return await checkPermission(permission)
  }

  /**
   * Require authentication and authorization in one call
   * Throws error if user is not authenticated or lacks permission
   */
  public async requireAuthAndPermission(permission: string) {
    const user = await this.authenticate()
    const hasPermission = await this.authorize(permission)
    
    if (!hasPermission) {
      throw new Error(`Permission denied: ${permission} required`)
    }
    
    return user
  }

  /**
   * Apply rate limiting to the request
   */
  public async applyRateLimit(request: NextRequest, type: keyof typeof RATE_LIMITS) {
    const rateLimitResponse = await applyRateLimit(request, type)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return null
  }

  /**
   * Handle common error types and return appropriate responses
   */
  public handleError(error: any): NextResponse {
    console.error('Service error:', error)

    // Handle validation errors
    const validationError = handleValidationError(error)
    if (validationError) return validationError

    // Handle auth errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle permission errors
    if (error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Handle not found errors
    if (error.message === 'Not found') {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Handle all other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  /**
   * Execute a database operation within a transaction
   */
  public async transaction<T>(
    callback: (tx: any) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(callback)
  }

  /**
   * Generic find with pagination
   */
  public async findMany<T>({
    model,
    where = {},
    include = {},
    orderBy = {},
    page = 1,
    limit = 50,
  }: {
    model: any
    where?: any
    include?: any
    orderBy?: any
    page?: number
    limit?: number
  }): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      model.count({ where }),
    ])

    return {
      data,
      total,
      page,
      limit,
    }
  }

  /**
   * Generic find by ID
   */
  public async findById<T>({
    model,
    id,
    include = {},
  }: {
    model: any
    id: string
    include?: any
  }): Promise<T | null> {
    return await model.findUnique({
      where: { id },
      include,
    })
  }

  /**
   * Generic create
   */
  public async create<T>({
    model,
    data,
    include = {},
  }: {
    model: any
    data: any
    include?: any
  }): Promise<T> {
    return await model.create({
      data,
      include,
    })
  }

  /**
   * Generic update
   */
  public async update<T>({
    model,
    id,
    data,
    include = {},
  }: {
    model: any
    id: string
    data: any
    include?: any
  }): Promise<T> {
    return await model.update({
      where: { id },
      data,
      include,
    })
  }

  /**
   * Generic delete
   */
  public async delete({
    model,
    id,
  }: {
    model: any
    id: string
  }): Promise<void> {
    await model.delete({
      where: { id },
    })
  }

  /**
   * Create audit event
   */
  public async createAuditEvent({
    actorId,
    action,
    resourceType,
    resourceId,
    metadata,
  }: {
    actorId: string
    action: string
    resourceType: string
    resourceId: string
    metadata?: any
  }) {
    await prisma.auditEvent.create({
      data: {
        actorId,
        action,
        resourceType,
        resourceId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    })
  }
}
