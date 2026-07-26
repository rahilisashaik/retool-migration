import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { featureFlagUpdateSchema, handleValidationError } from '@/lib/validations'
import { requireAuth, checkPermission, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/feature-flags/[id] - Get a specific feature flag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    // Check authentication
    const user = await requireAuth()
    
    // Check flag read permission
    const hasReadAccess = await checkPermission(PERMISSIONS.FLAG_READ)
    if (!hasReadAccess) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const flag = await prisma.featureFlag.findUnique({
      where: { id: params.id },
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
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ flag })
  } catch (error: any) {
    console.error('Error fetching feature flag:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch feature flag' },
      { status: 500 }
    )
  }
}

// PATCH /api/feature-flags/[id] - Update a feature flag
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.FLAG_WRITE)

    const body = await request.json()
    const data = featureFlagUpdateSchema.parse(body)

    // Get current flag
    const currentFlag = await prisma.featureFlag.findUnique({
      where: { id: params.id },
    })

    if (!currentFlag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}
    const changes: any[] = []

    if (data.name !== undefined) {
      updateData.name = data.name
      changes.push({ field: 'name', oldValue: currentFlag.name, newValue: data.name })
    }
    if (data.description !== undefined) {
      updateData.description = data.description
      changes.push({ field: 'description', oldValue: currentFlag.description, newValue: data.description })
    }
    if (data.state !== undefined) {
      updateData.state = data.state
      changes.push({ field: 'state', oldValue: currentFlag.state, newValue: data.state })
    }
    if (data.rolloutPercentage !== undefined) {
      updateData.rolloutPercentage = data.rolloutPercentage
      changes.push({ field: 'rolloutPercentage', oldValue: currentFlag.rolloutPercentage, newValue: data.rolloutPercentage })
    }
    if (data.targetSegment !== undefined) {
      updateData.targetSegment = data.targetSegment
      changes.push({ field: 'targetSegment', oldValue: currentFlag.targetSegment, newValue: data.targetSegment })
    }

    // Update flag, create change records and audit event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedFlag = await tx.featureFlag.update({
        where: { id: params.id },
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
            flagId: params.id,
            actorId: user.id,
            field: change.field,
            oldValue: String(change.oldValue),
            newValue: String(change.newValue),
            reason: data.reason,
          },
        })
      }

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'FEATURE_FLAG_UPDATED',
          resourceType: 'FeatureFlag',
          resourceId: params.id,
          metadata: JSON.stringify({ changes, reason: data.reason }),
        },
      })

      return updatedFlag
    })

    return NextResponse.json({ flag: result })
  } catch (error: any) {
    console.error('Error updating feature flag:', error)
    
    // Handle validation errors
    const validationError = handleValidationError(error)
    if (validationError) return validationError
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}

// DELETE /api/feature-flags/[id] - Delete a feature flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.FLAG_DELETE)

    const flag = await prisma.featureFlag.findUnique({
      where: { id: params.id },
    })

    if (!flag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    // Delete flag and create audit event in transaction
    await prisma.$transaction(async (tx) => {
      await tx.featureFlag.delete({
        where: { id: params.id },
      })

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'FEATURE_FLAG_DELETED',
          resourceType: 'FeatureFlag',
          resourceId: params.id,
          metadata: JSON.stringify({ key: flag.key }),
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting feature flag:', error)
    
    // Handle validation errors
    const validationError = handleValidationError(error)
    if (validationError) return validationError
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete feature flag' },
      { status: 500 }
    )
  }
}
