import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kycCaseTransitionSchema } from '@/lib/validations'
import { requireAuth, requirePermissionCheck } from '@/lib/auth-helper'
import { PERMISSIONS } from '@/lib/permissions'

// POST /api/kyc/[id]/transition - Transition KYC case status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    
    // Update case
    const updatedCase = await prisma.kycCase.update({
      where: { id: params.id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewerId: user.id,
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
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

    return NextResponse.json({ case: updatedCase })
  } catch (error: any) {
    console.error('Error transitioning KYC case:', error)
    
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
