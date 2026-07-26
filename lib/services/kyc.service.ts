import { BaseService } from './base.service'
import { prisma } from '@/lib/prisma'
import { KycStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * KYC Service - Handles all KYC-related business logic
 */
export class KycService extends BaseService {
  /**
   * Get all KYC cases with filters
   */
  async getKycCases(filters: {
    status?: KycStatus
    minRiskScore?: number
    maxRiskScore?: number
    assigneeId?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  }) {
    const where: any = {}

    if (filters.status) where.status = filters.status
    if (filters.minRiskScore !== undefined || filters.maxRiskScore !== undefined) {
      where.riskScore = {}
      if (filters.minRiskScore !== undefined) where.riskScore.gte = filters.minRiskScore
      if (filters.maxRiskScore !== undefined) where.riskScore.lte = filters.maxRiskScore
    }
    if (filters.assigneeId) where.reviewerId = filters.assigneeId
    if (filters.fromDate || filters.toDate) {
      where.submittedAt = {}
      if (filters.fromDate) where.submittedAt.gte = new Date(filters.fromDate)
      if (filters.toDate) where.submittedAt.lte = new Date(filters.toDate)
    }

    return this.findMany({
      model: prisma.kycCase,
      where,
      include: {
        reviewer: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        linkedRefunds: true,
      },
      orderBy: { submittedAt: 'desc' },
      page: filters.page,
      limit: filters.limit,
    })
  }

  /**
   * Get a specific KYC case by ID
   */
  async getKycCaseById(id: string) {
    const kycCase = await this.findById({
      model: prisma.kycCase,
      id,
      include: {
        reviewer: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        linkedRefunds: true,
      },
    })

    if (!kycCase) {
      throw new Error('Not found')
    }

    return kycCase
  }

  /**
   * Add a note to a KYC case
   */
  async addKycNote(caseId: string, authorId: string, body: string) {
    return this.transaction(async (tx) => {
      const note = await tx.kycNote.create({
        data: {
          caseId,
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
        action: 'KYC_NOTE_ADDED',
        resourceType: 'KycCase',
        resourceId: caseId,
        metadata: { noteId: note.id },
      })

      return note
    })
  }

  /**
   * Transition KYC case status
   */
  async transitionKycCase(
    caseId: string,
    status: KycStatus,
    reason: string,
    reviewerId: string
  ) {
    const currentCase = await this.findById({
      model: prisma.kycCase,
      id: caseId,
    })

    if (!currentCase) {
      throw new Error('Not found')
    }

    return this.transaction(async (tx) => {
      const updatedCase = await tx.kycCase.update({
        where: { id: caseId },
        data: {
          status,
          reviewedAt: new Date(),
          reviewerId,
        },
      })

      await this.createAuditEvent({
        actorId: reviewerId,
        action: `KYC_CASE_${status}`,
        resourceType: 'KycCase',
        resourceId: caseId,
        metadata: {
          oldStatus: currentCase.status,
          newStatus: status,
          reason,
        },
      })

      return updatedCase
    })
  }
}

// Singleton instance
export const kycService = new KycService()
