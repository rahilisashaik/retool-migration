import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/kyc/[id] - Get a specific KYC case
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kycCase = await prisma.kycCase.findUnique({
      where: { id: params.id },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        linkedRefunds: true,
      },
    })

    if (!kycCase) {
      return NextResponse.json(
        { error: 'KYC case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ case: kycCase })
  } catch (error) {
    console.error('Error fetching KYC case:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC case' },
      { status: 500 }
    )
  }
}
