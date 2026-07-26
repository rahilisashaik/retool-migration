import { NextRequest, NextResponse } from 'next/server'
import { kycNoteSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'

// POST /api/kyc/[id]/notes - Add a note to a KYC case
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
    const { body: noteBody } = kycNoteSchema.parse(body)

    const note = await kycService.addKycNote(params.id, user.id, noteBody)

    return NextResponse.json({ note })
  } catch (error: any) {
    return kycService.handleError(error)
  }
}
