import { NextRequest, NextResponse } from 'next/server'
import { auditLogFilterSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { auditService } from '@/lib/services/audit.service'
import { withGetHandler, parseQueryParams } from '@/lib/api-wrapper'

// GET /api/audit - Get audit log with filters
export const GET = withGetHandler({
  permission: PERMISSIONS.AUDIT_READ,
  service: auditService
}, async (request: NextRequest, { user }: { user?: any }) => {
  const filters = parseQueryParams(request, auditLogFilterSchema)

  const result = await auditService.getAuditEvents({
    ...filters,
    page: 1,
    limit: 100,
  })

  return NextResponse.json({ events: result.data, total: result.total })
})
