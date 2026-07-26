import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundTransitionSchema } from '@/lib/validations'

// POST /api/refunds/[id]/transition - Transition refund status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, reason } = refundTransitionSchema.parse(body)

    // Get current refund
    const currentRefund = await prisma.refundRequest.findUnique({
      where: { id: params.id },
    })

    if (!currentRefund) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      )
    }

    // Update refund
    const updatedRefund = await prisma.refundRequest.update({
      where: { id: params.id },
      data: {
        status,
      },
    })

    // Create audit event (using admin user for now - would normally be from auth session)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
        action: `REFUND_${status}`,
        resourceType: 'RefundRequest',
        resourceId: params.id,
        metadata: JSON.stringify({
          oldStatus: currentRefund.status,
          newStatus: status,
          reason,
        }),
      },
    })

    return NextResponse.json({ refund: updatedRefund })
  } catch (error) {
    console.error('Error transitioning refund:', error)
    return NextResponse.json(
      { error: 'Failed to transition refund' },
      { status: 500 }
    )
  }
}
