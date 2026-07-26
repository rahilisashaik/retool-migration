import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auditLogFilterSchema } from '@/lib/validations'

// GET /api/audit - Get audit log with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = auditLogFilterSchema.parse({
      actorId: searchParams.get('actorId') || undefined,
      action: searchParams.get('action') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    })

    const where: any = {}
    
    if (filters.actorId) where.actorId = filters.actorId
    if (filters.action) where.action = filters.action
    if (filters.resourceType) where.resourceType = filters.resourceType
    if (filters.resourceId) where.resourceId = filters.resourceId
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {}
      if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate)
      if (filters.toDate) where.createdAt.lte = new Date(filters.toDate)
    }

    const events = await prisma.auditEvent.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 events
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching audit log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    )
  }
}
