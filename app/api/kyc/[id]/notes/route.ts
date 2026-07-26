import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kycNoteSchema } from '@/lib/validations'

// POST /api/kyc/[id]/notes - Add a note to a KYC case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Get admin user for audit event (would normally be from auth session)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    // Create note
    const note = await prisma.kycNote.create({
      data: {
        caseId: params.id,
        authorId: adminUser?.id || 'system',
        body: noteBody,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
        action: 'KYC_NOTE_ADDED',
        resourceType: 'KycCase',
        resourceId: params.id,
        metadata: JSON.stringify({ noteId: note.id }),
      },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error adding KYC note:', error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}
