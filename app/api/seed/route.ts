import { NextResponse } from 'next/server'
import { seedDatabaseIfEmpty } from '@/lib/seed-database'

export async function POST() {
  try {
    await seedDatabaseIfEmpty()
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully (or already had data)' 
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to seed the database',
    usage: 'POST /api/seed'
  })
}