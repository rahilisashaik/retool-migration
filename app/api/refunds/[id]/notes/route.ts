import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundNoteSchema } from '@/lib/validations'

// POST /api/refunds/[id]/notes - Add a note to a refund request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Create note (using admin user for now - would normally be from auth session)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    const note = await prisma.refundNote.create({
      data: {
        refundId: params.id,
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
        action: 'REFUND_NOTE_ADDED',
        resourceType: 'RefundRequest',
        resourceId: params.id,
        metadata: JSON.stringify({ noteId: note.id }),
      },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error adding refund note:', error)
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    )
  }
}
