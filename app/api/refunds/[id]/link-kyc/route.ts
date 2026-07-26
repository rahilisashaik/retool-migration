import { NextRequest, NextResponse } from 'next/server'
import { refundLinkKycSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'
import { withMutationHandler } from '@/lib/api-wrapper'

// POST /api/refunds/[id]/link-kyc - Link refund to KYC case
export const POST = withMutationHandler({
  permission: PERMISSIONS.REFUND_WRITE,
  service: refundService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const body = await request.json()
  const { kycCaseId } = refundLinkKycSchema.parse(body)

  const updatedRefund = await refundService.linkRefundToKyc(params.id, kycCaseId, user.id)

  return NextResponse.json({ refund: updatedRefund })
})
