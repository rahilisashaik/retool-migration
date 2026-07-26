import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundLinkKycSchema } from '@/lib/validations'

// POST /api/refunds/[id]/link-kyc - Link refund to KYC case
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Link refund to KYC case
    const updatedRefund = await prisma.refundRequest.update({
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

    // Create audit event (using admin user for now - would normally be from auth session)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })
    
    await prisma.auditEvent.create({
      data: {
        actorId: adminUser?.id || 'system',
        action: 'REFUND_LINKED_KYC',
        resourceType: 'RefundRequest',
        resourceId: params.id,
        metadata: JSON.stringify({ kycCaseId }),
      },
    })

    return NextResponse.json({ refund: updatedRefund })
  } catch (error) {
    console.error('Error linking refund to KYC case:', error)
    return NextResponse.json(
      { error: 'Failed to link refund to KYC case' },
      { status: 500 }
    )
  }
}
