import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { refundFilterSchema } from '@/lib/validations'

// GET /api/refunds - List refund requests with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = refundFilterSchema.parse({
      orderId: searchParams.get('orderId') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      status: searchParams.get('status') || undefined,
      minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
      maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
      currency: searchParams.get('currency') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
    })

    const where: any = {}
    
    if (filters.orderId) where.orderId = filters.orderId
    if (filters.customerId) where.customerId = filters.customerId
    if (filters.status) where.status = filters.status
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {}
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount
    }
    if (filters.currency) where.currency = filters.currency
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {}
      if (filters.fromDate) where.createdAt.gte = new Date(filters.fromDate)
      if (filters.toDate) where.createdAt.lte = new Date(filters.toDate)
    }

    const refunds = await prisma.refundRequest.findMany({
      where,
      include: {
        kycCase: {
          select: {
            id: true,
            status: true,
            riskScore: true,
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ refunds })
  } catch (error) {
    console.error('Error fetching refund requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refund requests' },
      { status: 500 }
    )
  }
}
