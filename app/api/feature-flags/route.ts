import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { featureFlagFilterSchema, featureFlagCreateSchema } from '@/lib/validations'

// GET /api/feature-flags - List feature flags with filters
export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

// POST /api/feature-flags - Create a new feature flag
export async function POST(request: NextRequest) {
  try {
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

    // Create feature flag (using admin user for now - would normally be from auth session)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    const flag = await prisma.featureFlag.create({
      data: {
        ...data,
        ownerId: adminUser?.id || 'system',
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
        action: 'FEATURE_FLAG_CREATED',
        resourceType: 'FeatureFlag',
        resourceId: flag.id,
        metadata: JSON.stringify({ key: data.key }),
      },
    })

    return NextResponse.json({ flag }, { status: 201 })
  } catch (error) {
    console.error('Error creating feature flag:', error)
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    )
  }
}
