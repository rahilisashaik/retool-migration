import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auditLogFilterSchema, handleValidationError } from '@/lib/validations'
import { requireAuth, checkPermission } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'

// GET /api/audit - Get audit log with filters
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth()
    
    // Check audit read permission
    const hasReadAccess = await checkPermission(PERMISSIONS.AUDIT_READ)
    if (!hasReadAccess) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

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
  } catch (error: any) {
    console.error('Error fetching audit log:', error)
    
    // Handle validation errors
    const validationError = handleValidationError(error)
    if (validationError) return validationError
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    )
  }
}
