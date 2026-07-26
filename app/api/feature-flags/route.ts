import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { featureFlagFilterSchema, featureFlagCreateSchema } from '@/lib/validations'
import { requireAuth, checkPermission, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'

// GET /api/feature-flags - List feature flags with filters
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    
    const filters = featureFlagFilterSchema.parse({
      environment: searchParams.get('environment') || undefined,
      state: searchParams.get('state') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      type: searchParams.get('type') || undefined,
    })

    const where: any = {}
    
    if (filters.environment) where.environment = filters.environment
    if (filters.state) where.state = filters.state
    if (filters.ownerId) where.ownerId = filters.ownerId
    if (filters.type) where.type = filters.type

    const flags = await prisma.featureFlag.findMany({
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
    })

    return NextResponse.json({ flags })
  } catch (error: any) {
    console.error('Error fetching feature flags:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

// POST /api/feature-flags - Create a new feature flag
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.FLAG_WRITE)

    const body = await request.json()
    const data = featureFlagCreateSchema.parse(body)

    // Check if key already exists
    const existing = await prisma.featureFlag.findUnique({
      where: { key: data.key },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Feature flag with this key already exists' },
        { status: 400 }
      )
    }

    // Create feature flag and audit event in transaction
    const flag = await prisma.$transaction(async (tx) => {
      const newFlag = await tx.featureFlag.create({
        data: {
          ...data,
          ownerId: user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'FEATURE_FLAG_CREATED',
          resourceType: 'FeatureFlag',
          resourceId: newFlag.id,
          metadata: JSON.stringify({ key: data.key }),
        },
      })

      return newFlag
    })

    return NextResponse.json({ flag }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating feature flag:', error)
    
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
      { error: 'Failed to create feature flag' },
      { status: 500 }
    )
  }
}
