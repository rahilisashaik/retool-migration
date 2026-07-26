import { NextRequest, NextResponse } from 'next/server'
import { kycCaseFilterSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'

// GET /api/kyc - List KYC cases with filters
export async function GET(request: NextRequest) {
  try {
    // Apply authentication and authorization
    await kycService.requireAuthAndPermission(PERMISSIONS.KYC_READ)

    // Apply rate limiting
    const rateLimitResponse = await kycService.applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(request.url)
    
    const filters = kycCaseFilterSchema.parse({
      status: searchParams.get('status') || undefined,
      minRiskScore: searchParams.get('minRiskScore') ? Number(searchParams.get('minRiskScore')) : undefined,
      maxRiskScore: searchParams.get('maxRiskScore') ? Number(searchParams.get('maxRiskScore')) : undefined,
      assigneeId: searchParams.get('assigneeId') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    })

    const result = await kycService.getKycCases({
      ...filters,
      page: 1,
      limit: 50,
    })

    return NextResponse.json({ cases: result.data, total: result.total })
  } catch (error: any) {
    return kycService.handleError(error)
  }
}
