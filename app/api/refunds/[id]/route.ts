import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/refunds/[id] - Get a specific refund request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: params.id },
      include: {
        kycCase: {
          select: {
            id: true,
            status: true,
            riskScore: true,
            customerId: true,
          },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ refund })
  } catch (error) {
    console.error('Error fetching refund request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refund request' },
      { status: 500 }
    )
  }
}
