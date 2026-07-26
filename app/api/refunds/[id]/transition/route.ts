import { NextRequest, NextResponse } from 'next/server'
import { refundTransitionSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'

// POST /api/refunds/[id]/transition - Transition refund status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply authentication and authorization
    const user = await refundService.requireAuthAndPermission(PERMISSIONS.REFUND_WRITE)

    // Apply rate limiting
    const rateLimitResponse = await refundService.applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const { status, reason } = refundTransitionSchema.parse(body)

    const updatedRefund = await refundService.transitionRefund(params.id, status, reason, user.id)

    return NextResponse.json({ refund: updatedRefund })
  } catch (error: any) {
    return refundService.handleError(error)
  }
}
