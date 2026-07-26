import { NextRequest, NextResponse } from 'next/server'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'
import { withGetHandler } from '@/lib/api-wrapper'

// GET /api/kyc/[id] - Get a specific KYC case
export const GET = withGetHandler({
  permission: PERMISSIONS.KYC_READ,
  service: kycService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const kycCase = await kycService.getKycCaseById(params.id)

  return NextResponse.json({ case: kycCase })
})
