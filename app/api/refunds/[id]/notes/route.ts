import { NextRequest, NextResponse } from 'next/server'
import { refundNoteSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { refundService } from '@/lib/services/refund.service'
import { withMutationHandler } from '@/lib/api-wrapper'

// POST /api/refunds/[id]/notes - Add a note to a refund request
export const POST = withMutationHandler({
  permission: PERMISSIONS.REFUND_WRITE,
  service: refundService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const body = await request.json()
  const { body: noteBody } = refundNoteSchema.parse(body)

  const note = await refundService.addRefundNote(params.id, user.id, noteBody)

  return NextResponse.json({ note })
})
