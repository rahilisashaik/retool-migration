import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kycCaseFilterSchema } from '@/lib/validations'

// GET /api/kyc - List KYC cases with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = kycCaseFilterSchema.parse({
      status: searchParams.get('status') || undefined,
      minRiskScore: searchParams.get('minRiskScore') ? Number(searchParams.get('minRiskScore')) : undefined,
      maxRiskScore: searchParams.get('maxRiskScore') ? Number(searchParams.get('maxRiskScore')) : undefined,
      assigneeId: searchParams.get('assigneeId') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    })

    const where: any = {}
    
    if (filters.status) where.status = filters.status
    if (filters.minRiskScore !== undefined || filters.maxRiskScore !== undefined) {
      where.riskScore = {}
      if (filters.minRiskScore !== undefined) where.riskScore.gte = filters.minRiskScore
      if (filters.maxRiskScore !== undefined) where.riskScore.lte = filters.maxRiskScore
    }
    if (filters.assigneeId) where.reviewerId = filters.assigneeId
    if (filters.fromDate || filters.toDate) {
      where.submittedAt = {}
      if (filters.fromDate) where.submittedAt.gte = new Date(filters.fromDate)
      if (filters.toDate) where.submittedAt.lte = new Date(filters.toDate)
    }

    const cases = await prisma.kycCase.findMany({
      where,
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
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error('Error fetching KYC cases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC cases' },
      { status: 500 }
    )
  }
}
