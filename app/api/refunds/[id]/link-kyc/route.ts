import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundLinkKycSchema, handleValidationError } from '@/lib/validations'
import { requireAuth, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'

// POST /api/refunds/[id]/link-kyc - Link refund to KYC case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.REFUND_WRITE)

    const body = await request.json()
    const { kycCaseId } = refundLinkKycSchema.parse(body)

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

    // Verify KYC case exists
    const kycCase = await prisma.kycCase.findUnique({
      where: { id: kycCaseId },
    })

    if (!kycCase) {
      return NextResponse.json(
        { error: 'KYC case not found' },
        { status: 404 }
      )
    }

    // Link refund to KYC case and create audit event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedRefund = await tx.refundRequest.update({
        where: { id: params.id },
        data: {
          kycCaseId,
        },
        include: {
          kycCase: {
            select: {
              id: true,
              status: true,
              riskScore: true,
            },
          },
        },
      })

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'REFUND_LINKED_KYC',
          resourceType: 'RefundRequest',
          resourceId: params.id,
          metadata: JSON.stringify({ kycCaseId }),
        },
      })

      return updatedRefund
    })

    return NextResponse.json({ refund: result })
  } catch (error: any) {
    console.error('Error linking refund to KYC case:', error)
    
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
      { error: 'Failed to link refund to KYC case' },
      { status: 500 }
    )
  }
}
