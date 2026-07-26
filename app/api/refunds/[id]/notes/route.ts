import { NextRequest, NextResponse } from 'next/server'
import { refundNoteSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'

// POST /api/refunds/[id]/notes - Add a note to a refund request
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
    const { body: noteBody } = refundNoteSchema.parse(body)

    const note = await refundService.addRefundNote(params.id, user.id, noteBody)

    return NextResponse.json({ note })
  } catch (error: any) {
    return refundService.handleError(error)
  }
}
