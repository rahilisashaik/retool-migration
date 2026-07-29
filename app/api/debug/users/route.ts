import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // Don't return password hash for security
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length 
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}