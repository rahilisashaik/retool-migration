import { NextRequest, NextResponse } from 'next/server'
import { kycCaseFilterSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'
import { withGetHandler, parseQueryParams } from '@/lib/api-wrapper'

// GET /api/kyc - List KYC cases with filters
export const GET = withGetHandler({
  permission: PERMISSIONS.KYC_READ,
  service: kycService
}, async (request: NextRequest, { user }: { user?: any }) => {
  const filters = parseQueryParams(request, kycCaseFilterSchema)

  const result = await kycService.getKycCases({
    ...filters,
    page: 1,
    limit: 50,
  })

  return NextResponse.json({ cases: result.data, total: result.total })
})
