import { NextRequest, NextResponse } from 'next/server'
import { refundTransitionSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'
import { withMutationHandler } from '@/lib/api-wrapper'

// POST /api/refunds/[id]/transition - Transition refund status
export const POST = withMutationHandler({
  permission: PERMISSIONS.REFUND_WRITE,
  service: refundService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const body = await request.json()
  const { status, reason } = refundTransitionSchema.parse(body)

  const updatedRefund = await refundService.transitionRefund(params.id, status, reason, user.id)

  return NextResponse.json({ refund: updatedRefund })
})
