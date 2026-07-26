import { NextRequest, NextResponse } from 'next/server'
import { kycCaseTransitionSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'
import { withMutationHandler } from '@/lib/api-wrapper'

// POST /api/kyc/[id]/transition - Transition KYC case status
export const POST = withMutationHandler({
  permission: PERMISSIONS.KYC_WRITE,
  service: kycService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const body = await request.json()
  const { status, reason } = kycCaseTransitionSchema.parse(body)

  const updatedCase = await kycService.transitionKycCase(params.id, status, reason, user.id)

  return NextResponse.json({ case: updatedCase })
})
