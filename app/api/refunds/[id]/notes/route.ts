import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundNoteSchema, handleValidationError } from '@/lib/validations'
import { requireAuth, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/refunds/[id]/notes - Add a note to a refund request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.REFUND_WRITE)

    const body = await request.json()
    const { body: noteBody } = refundNoteSchema.parse(body)

    // Verify refund exists
    const refund = await prisma.refundRequest.findUnique({
      where: { id: params.id },
    })

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      )
    }

    // Create note and audit event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.refundNote.create({
        data: {
          refundId: params.id,
          authorId: user.id,
          body: noteBody,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'REFUND_NOTE_ADDED',
          resourceType: 'RefundRequest',
          resourceId: params.id,
          metadata: JSON.stringify({ noteId: note.id }),
        },
      })

      return note
    })

    return NextResponse.json({ note: result })
  } catch (error: any) {
    console.error('Error adding refund note:', error)
    
    // Handle validation errors
    const validationError = handleValidationError(error)
    if (validationError) return validationError
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}
