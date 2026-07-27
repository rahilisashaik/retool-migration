import { BaseService } from './base.service'
import { prisma } from '@/lib/prisma'
import { parseStartOfDay, parseEndOfDay } from '@/lib/utils'

/**
 * Audit Service - Handles all audit-related business logic
 */
export class AuditService extends BaseService {
  /**
   * Get audit events with filters
   */
  public async getAuditEvents(filters: {
    actorId?: string
    action?: string
    resourceType?: string
    resourceId?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }) {
    const where: any = {}

    if (filters.actorId) where.actorId = filters.actorId
    if (filters.action) where.action = filters.action
    if (filters.resourceType) where.resourceType = filters.resourceType
    if (filters.resourceId) where.resourceId = filters.resourceId
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {}
      if (filters.fromDate) where.createdAt.gte = parseStartOfDay(filters.fromDate)
      if (filters.toDate) where.createdAt.lte = parseEndOfDay(filters.toDate)
    }

    return this.findMany({
      model: prisma.auditEvent,
      where,
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      page: filters.page,
      limit: filters.limit || 100, // Default to 100 for audit logs
    })
  }
}

// Singleton instance
export const auditService = new AuditService()
