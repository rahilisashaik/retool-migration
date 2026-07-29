import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  })
}