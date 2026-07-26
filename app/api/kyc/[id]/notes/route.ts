import { NextRequest, NextResponse } from 'next/server'
import { kycNoteSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { kycService } from '@/lib/services/kyc.service'
import { withMutationHandler } from '@/lib/api-wrapper'

// POST /api/kyc/[id]/notes - Add a note to a KYC case
export const POST = withMutationHandler({
  permission: PERMISSIONS.KYC_WRITE,
  service: kycService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const body = await request.json()
  const { body: noteBody } = kycNoteSchema.parse(body)

  const note = await kycService.addKycNote(params.id, user.id, noteBody)

  return NextResponse.json({ note })
})
