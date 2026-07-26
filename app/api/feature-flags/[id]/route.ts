import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { featureFlagUpdateSchema } from '@/lib/validations'

// GET /api/feature-flags/[id] - Get a specific feature flag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch (error) {
    console.error('Error fetching feature flag:', error)
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

    // Update flag
    const updatedFlag = await prisma.featureFlag.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Create change records and audit events (using admin user for now)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    for (const change of changes) {
      await prisma.featureFlagChange.create({
        data: {
          flagId: params.id,
          actorId: adminUser?.id || 'system',
          field: change.field,
          oldValue: String(change.oldValue),
          newValue: String(change.newValue),
          reason: data.reason,
        },
      })
    }

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
        action: 'FEATURE_FLAG_UPDATED',
        resourceType: 'FeatureFlag',
        resourceId: params.id,
        metadata: JSON.stringify({ changes, reason: data.reason }),
      },
    })

    return NextResponse.json({ flag: updatedFlag })
  } catch (error) {
    console.error('Error updating feature flag:', error)
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
    const flag = await prisma.featureFlag.findUnique({
      where: { id: params.id },
    })

    if (!flag) {
      return NextResponse.json(
        { error: 'Feature flag not found' },
        { status: 404 }
      )
    }

    await prisma.featureFlag.delete({
      where: { id: params.id },
    })

    // Create audit event (using admin user for now)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
        action: 'FEATURE_FLAG_DELETED',
        resourceType: 'FeatureFlag',
        resourceId: params.id,
        metadata: JSON.stringify({ key: flag.key }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature flag:', error)
    return NextResponse.json(
      { error: 'Failed to delete feature flag' },
      { status: 500 }
    )
  }
}
