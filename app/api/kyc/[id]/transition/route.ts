import { NextRequest, NextResponse } from 'next/server'
import { kycCaseTransitionSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'

// POST /api/kyc/[id]/transition - Transition KYC case status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply authentication and authorization
    const user = await kycService.requireAuthAndPermission(PERMISSIONS.KYC_WRITE)

    // Apply rate limiting
    const rateLimitResponse = await kycService.applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const { status, reason } = kycCaseTransitionSchema.parse(body)

    const updatedCase = await kycService.transitionKycCase(params.id, status, reason, user.id)

    return NextResponse.json({ case: updatedCase })
  } catch (error: any) {
    return kycService.handleError(error)
  }
}
