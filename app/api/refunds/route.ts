import { NextRequest, NextResponse } from 'next/server'
import { refundFilterSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'
import { withGetHandler, parseQueryParams } from '@/lib/api-wrapper'

// GET /api/refunds - List refund requests with filters
export const GET = withGetHandler({
  permission: PERMISSIONS.REFUND_READ,
  service: refundService
}, async (request: NextRequest, { user }: { user?: any }) => {
  const filters = parseQueryParams(request, refundFilterSchema)

  const result = await refundService.getRefundRequests({
    ...filters,
    page: 1,
    limit: 50,
  })

  return NextResponse.json({ refunds: result.data, total: result.total })
})
