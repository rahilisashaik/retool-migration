import { BaseService } from './base.service'
import { prisma } from '@/lib/prisma'
import { Environment, FeatureFlagType, FeatureFlagState } from '@prisma/client'

/**
 * Type-safe feature flag update data
 */
interface FeatureFlagUpdateData {
  name?: string
  description?: string
  state?: FeatureFlagState
  rolloutPercentage?: number
  targetSegment?: string
}

/**
 * Type-safe feature flag change record
 */
interface FeatureFlagChange {
  field: string
  oldValue: string | number | null
  newValue: string | number | null
}

/**
 * Feature Flag Service - Handles all feature flag-related business logic
 */
export class FeatureFlagService extends BaseService {
  /**
   * Get all feature flags with filters
   */
  async getFeatureFlags(filters: {
    environment?: Environment
    state?: FeatureFlagState
    ownerId?: string
    type?: FeatureFlagType
    page?: number
    limit?: number
  }) {
    const where: any = {}

    if (filters.environment) where.environment = filters.environment
    if (filters.state) where.state = filters.state
    if (filters.ownerId) where.ownerId = filters.ownerId
    if (filters.type) where.type = filters.type

    return this.findMany({
      model: prisma.featureFlag,
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        changes: {
          include: {
            actor: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
      page: filters.page,
      limit: filters.limit,
    })
  }

  /**
   * Get a specific feature flag by ID
   */
  async getFeatureFlagById(id: string) {
    const flag = await this.findById({
      model: prisma.featureFlag,
      id,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        changes: {
          include: {
            actor: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!flag) {
      throw new Error('Not found')
    }

    return flag
  }

  /**
   * Create a new feature flag
   */
  async createFeatureFlag(data: {
    key: string
    name: string
    description?: string
    environment: Environment
    type: FeatureFlagType
    state?: FeatureFlagState
    rolloutPercentage?: number
    targetSegment?: string
    ownerId: string
  }) {
    // Check if key already exists
    const existing = await prisma.featureFlag.findUnique({
      where: { key: data.key },
    })

    if (existing) {
      throw new Error('Feature flag with this key already exists')
    }

    return this.transaction(async (tx) => {
      const flag = await tx.featureFlag.create({
        data: {
          ...data,
          state: data.state || FeatureFlagState.DISABLED,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      await this.createAuditEvent({
        actorId: data.ownerId,
        action: 'FEATURE_FLAG_CREATED',
        resourceType: 'FeatureFlag',
        resourceId: flag.id,
        metadata: { key: data.key },
      })

      return flag
    })
  }

  /**
   * Update a feature flag
   */
  async updateFeatureFlag(
    id: string,
    updates: FeatureFlagUpdateData & { reason?: string },
    actorId: string
  ) {
    const currentFlag = await this.findById({
      model: prisma.featureFlag,
      id,
    })

    if (!currentFlag) {
      throw new Error('Not found')
    }

    const updateData: FeatureFlagUpdateData = {}
    const changes: FeatureFlagChange[] = []

    if (updates.name !== undefined) {
      updateData.name = updates.name
      changes.push({ field: 'name', oldValue: currentFlag.name, newValue: updates.name })
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description
      changes.push({ field: 'description', oldValue: currentFlag.description, newValue: updates.description })
    }
    if (updates.state !== undefined) {
      updateData.state = updates.state
      changes.push({ field: 'state', oldValue: currentFlag.state, newValue: updates.state })
    }
    if (updates.rolloutPercentage !== undefined) {
      updateData.rolloutPercentage = updates.rolloutPercentage
      changes.push({ field: 'rolloutPercentage', oldValue: currentFlag.rolloutPercentage, newValue: updates.rolloutPercentage })
    }
    if (updates.targetSegment !== undefined) {
      updateData.targetSegment = updates.targetSegment
      changes.push({ field: 'targetSegment', oldValue: currentFlag.targetSegment, newValue: updates.targetSegment })
    }

    return this.transaction(async (tx) => {
      const updatedFlag = await tx.featureFlag.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Create change records
      for (const change of changes) {
        await tx.featureFlagChange.create({
          data: {
            flagId: id,
            actorId,
            field: change.field,
            oldValue: String(change.oldValue),
            newValue: String(change.newValue),
            reason: updates.reason,
          },
        })
      }

      await this.createAuditEvent({
        actorId,
        action: 'FEATURE_FLAG_UPDATED',
        resourceType: 'FeatureFlag',
        resourceId: id,
        metadata: { changes, reason: updates.reason },
      })

      return updatedFlag
    })
  }

  /**
   * Delete a feature flag
   */
  async deleteFeatureFlag(id: string, actorId: string) {
    const flag = await this.findById({
      model: prisma.featureFlag,
      id,
    })

    if (!flag) {
      throw new Error('Not found')
    }

    return this.transaction(async (tx) => {
      await tx.featureFlag.delete({
        where: { id },
      })

      await this.createAuditEvent({
        actorId,
        action: 'FEATURE_FLAG_DELETED',
        resourceType: 'FeatureFlag',
        resourceId: id,
        metadata: { key: flag.key },
      })
    })
  }
}

// Singleton instance
export const featureFlagService = new FeatureFlagService()
