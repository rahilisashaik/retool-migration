import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kycNoteSchema } from '@/lib/validations'
import { requireAuth, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'

// POST /api/kyc/[id]/notes - Add a note to a KYC case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.KYC_WRITE)

    const body = await request.json()
    const { body: noteBody } = kycNoteSchema.parse(body)

    // Verify case exists
    const kycCase = await prisma.kycCase.findUnique({
      where: { id: params.id },
    })

    if (!kycCase) {
      return NextResponse.json(
        { error: 'KYC case not found' },
        { status: 404 }
      )
    }

    // Create note and audit event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const note = await tx.kycNote.create({
        data: {
          caseId: params.id,
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
          action: 'KYC_NOTE_ADDED',
          resourceType: 'KycCase',
          resourceId: params.id,
          metadata: JSON.stringify({ noteId: note.id }),
        },
      })

      return note
    })

    return NextResponse.json({ note: result })
  } catch (error: any) {
    console.error('Error adding KYC note:', error)
    
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
