import { NextRequest, NextResponse } from 'next/server'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'
import { withGetHandler } from '@/lib/api-wrapper'

// GET /api/refunds/[id] - Get a specific refund request
export const GET = withGetHandler({
  permission: PERMISSIONS.REFUND_READ,
  service: refundService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const refund = await refundService.getRefundById(params.id)

  return NextResponse.json({ refund })
})
