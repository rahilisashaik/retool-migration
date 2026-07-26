import { NextRequest, NextResponse } from 'next/server'
import { auditLogFilterSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { auditService } from '@/lib/services/audit.service'

// GET /api/audit - Get audit log with filters
export async function GET(request: NextRequest) {
  try {
    // Apply authentication and authorization
    await auditService.requireAuthAndPermission(PERMISSIONS.AUDIT_READ)

    // Apply rate limiting
    const rateLimitResponse = await auditService.applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(request.url)
    
    const filters = auditLogFilterSchema.parse({
      actorId: searchParams.get('actorId') || undefined,
      action: searchParams.get('action') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    })

    const result = await auditService.getAuditEvents({
      ...filters,
      page: 1,
      limit: 100,
    })

    return NextResponse.json({ events: result.data, total: result.total })
  } catch (error: any) {
    return auditService.handleError(error)
  }
}
