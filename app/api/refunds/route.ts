import { NextRequest, NextResponse } from 'next/server'
import { refundFilterSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'

// GET /api/refunds - List refund requests with filters
export async function GET(request: NextRequest) {
  try {
    // Apply authentication and authorization
    await refundService.requireAuthAndPermission(PERMISSIONS.REFUND_READ)

    // Apply rate limiting
    const rateLimitResponse = await refundService.applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(request.url)
    
    const filters = refundFilterSchema.parse({
      orderId: searchParams.get('orderId') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      status: searchParams.get('status') || undefined,
      minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
      maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
      currency: searchParams.get('currency') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    })

    const result = await refundService.getRefundRequests({
      ...filters,
      page: 1,
      limit: 50,
    })

    return NextResponse.json({ refunds: result.data, total: result.total })
  } catch (error: any) {
    return refundService.handleError(error)
  }
}
