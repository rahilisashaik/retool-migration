import { NextRequest, NextResponse } from 'next/server'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'

// GET /api/kyc/[id] - Get a specific KYC case
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply authentication and authorization
    await kycService.requireAuthAndPermission(PERMISSIONS.KYC_READ)

    // Apply rate limiting
    const rateLimitResponse = await kycService.applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    const kycCase = await kycService.getKycCaseById(params.id)

    return NextResponse.json({ case: kycCase })
  } catch (error: any) {
    return kycService.handleError(error)
  }
}
