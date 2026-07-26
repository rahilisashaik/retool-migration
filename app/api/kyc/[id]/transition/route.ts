import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kycCaseTransitionSchema } from '@/lib/validations'

// POST /api/kyc/[id]/transition - Transition KYC case status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Get admin user for audit event (would normally be from auth session)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    // Update case
    const updatedCase = await prisma.kycCase.update({
      where: { id: params.id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewerId: adminUser?.id, // For simplicity, would normally be from auth session
      },
    })

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
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
  } catch (error) {
    console.error('Error transitioning KYC case:', error)
    return NextResponse.json(
      { error: 'Failed to transition KYC case' },
      { status: 500 }
    )
  }
}
