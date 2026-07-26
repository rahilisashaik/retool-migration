import { NextRequest, NextResponse } from 'next/server'
import { refundLinkKycSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'

// POST /api/refunds/[id]/link-kyc - Link refund to KYC case
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
    const { kycCaseId } = refundLinkKycSchema.parse(body)

    const updatedRefund = await refundService.linkRefundToKyc(params.id, kycCaseId, user.id)

    return NextResponse.json({ refund: updatedRefund })
  } catch (error: any) {
    return refundService.handleError(error)
  }
}
