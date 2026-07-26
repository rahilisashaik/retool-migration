import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kycCaseTransitionSchema, handleValidationError } from '@/lib/validations'
import { requireAuth, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// POST /api/kyc/[id]/transition - Transition KYC case status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    // Check authentication and permissions
    const user = await requirePermissionCheck(PERMISSIONS.KYC_WRITE)

    const body = await request.json()
    const { status, reason } = kycCaseTransitionSchema.parse(body)

    // Get current case
    const currentCase = await prisma.kycCase.findUnique({
      where: { id: params.id },
    })

    if (!currentCase) {
      return NextResponse.json(
        { error: 'KYC case not found' },
        { status: 404 }
      )
    }
    
    // Update case and create audit event in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedCase = await tx.kycCase.update({
        where: { id: params.id },
        data: {
          status,
          reviewedAt: new Date(),
          reviewerId: user.id,
        },
      })

      // Create audit event
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: `KYC_CASE_${status}`,
          resourceType: 'KycCase',
          resourceId: params.id,
          metadata: JSON.stringify({
            oldStatus: currentCase.status,
            newStatus: status,
            reason,
          }),
        },
      })

      return updatedCase
    })

    return NextResponse.json({ case: result })
  } catch (error: any) {
    console.error('Error transitioning KYC case:', error)
    
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
      { error: 'Failed to transition KYC case' },
      { status: 500 }
    )
  }
}
