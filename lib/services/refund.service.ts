import { BaseService } from './base.service'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { parseStartOfDay, parseEndOfDay } from '@/lib/utils'

/**
 * Refund Service - Handles all refund-related business logic
 */
export class RefundService extends BaseService {
  /**
   * Get all refund requests with filters
   */
  public async getRefundRequests(filters: {
    orderId?: string
    customerId?: string
    status?: string
    minAmount?: number
    maxAmount?: number
    currency?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }) {
    const where: any = {}

    if (filters.orderId) where.orderId = filters.orderId
    if (filters.customerId) where.customerId = filters.customerId
    if (filters.status) where.status = filters.status
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {}
      if (filters.minAmount !== undefined) where.amount.gte = new Decimal(filters.minAmount)
      if (filters.maxAmount !== undefined) where.amount.lte = new Decimal(filters.maxAmount)
    }
    if (filters.currency) where.currency = filters.currency
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {}
      if (filters.fromDate) where.createdAt.gte = parseStartOfDay(filters.fromDate)
      if (filters.toDate) where.createdAt.lte = parseEndOfDay(filters.toDate)
    }

    const result = await this.findMany({
      model: prisma.refundRequest,
      where,
      include: {
        kycCase: {
          select: {
            id: true,
            status: true,
            riskScore: true,
          },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      page: filters.page,
      limit: filters.limit,
    })

    // Convert Decimal to number for JSON serialization
    return {
      ...result,
      data: result.data.map((refund: any) => ({
        ...refund,
        amount: Number(refund.amount),
      })),
    }
  }

  /**
   * Get a specific refund request by ID
   */
  public async getRefundById(id: string) {
    const refund: any = await this.findById({
      model: prisma.refundRequest,
      id,
      include: {
        kycCase: {
          select: {
            id: true,
            status: true,
            riskScore: true,
          },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!refund) {
      throw new Error('Not found')
    }

    // Convert Decimal to number for JSON serialization
    return {
      ...refund,
      amount: Number(refund.amount),
    }
  }

  /**
   * Add a note to a refund request
   */
  public async addRefundNote(refundId: string, authorId: string, body: string) {
    return this.transaction(async (tx) => {
      const note = await tx.refundNote.create({
        data: {
          refundId,
          authorId,
          body,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      await this.createAuditEvent({
        actorId: authorId,
        action: 'REFUND_NOTE_ADDED',
        resourceType: 'RefundRequest',
        resourceId: refundId,
        metadata: { noteId: note.id },
        tx,
      })

      return note
    })
  }

  /**
   * Transition refund status
   */
  public async transitionRefund(
    refundId: string,
    status: string,
    reason: string,
    actorId: string
  ) {
    const currentRefund: any = await this.findById({
      model: prisma.refundRequest,
      id: refundId,
    })

    if (!currentRefund) {
      throw new Error('Not found')
    }

    return this.transaction(async (tx) => {
      const updatedRefund = await tx.refundRequest.update({
        where: { id: refundId },
        data: {
          status,
        },
      })

      await this.createAuditEvent({
        actorId,
        action: `REFUND_${status}`,
        resourceType: 'RefundRequest',
        resourceId: refundId,
        metadata: {
          oldStatus: currentRefund.status,
          newStatus: status,
          reason,
        },
        tx,
      })

      return updatedRefund
    })
  }

  /**
   * Link refund to KYC case
   */
  public async linkRefundToKyc(refundId: string, kycCaseId: string, actorId: string) {
    const refund = await this.findById({
      model: prisma.refundRequest,
      id: refundId,
    })

    if (!refund) {
      throw new Error('Not found')
    }

    const kycCase = await this.findById({
      model: prisma.kycCase,
      id: kycCaseId,
    })

    if (!kycCase) {
      throw new Error('KYC case not found')
    }

    return this.transaction(async (tx) => {
      const updatedRefund = await tx.refundRequest.update({
        where: { id: refundId },
        data: {
          kycCaseId,
        },
        include: {
          kycCase: {
            select: {
              id: true,
              status: true,
              riskScore: true,
            },
          },
        },
      })

      await this.createAuditEvent({
        actorId,
        action: 'REFUND_LINKED_KYC',
        resourceType: 'RefundRequest',
        resourceId: refundId,
        metadata: { kycCaseId },
        tx,
      })

      return updatedRefund
    })
  }
}

// Singleton instance
export const refundService = new RefundService()
