import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundTransitionSchema, handleValidationError } from '@/lib/validations'
import { requireAuth, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/refunds/[id]/transition - Transition refund status
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

    // Update refund and create audit event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedRefund = await tx.refundRequest.update({
        where: { id: params.id },
        data: {
          status,
        },
      })

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
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

      return updatedRefund
    })

    return NextResponse.json({ refund: result })
  } catch (error: any) {
    console.error('Error transitioning refund:', error)
    
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
      { error: 'Failed to transition refund' },
      { status: 500 }
    )
  }
}
