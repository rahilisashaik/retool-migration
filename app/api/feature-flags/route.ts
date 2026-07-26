import { NextRequest, NextResponse } from 'next/server'
import { featureFlagFilterSchema, featureFlagCreateSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { featureFlagService } from '@/lib/services/feature-flag.service'

// GET /api/feature-flags - List feature flags with filters
export async function GET(request: NextRequest) {
  try {
    // Apply authentication and authorization
    await featureFlagService.requireAuthAndPermission(PERMISSIONS.FLAG_READ)

    // Apply rate limiting
    const rateLimitResponse = await featureFlagService.applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(request.url)
    
    const filters = featureFlagFilterSchema.parse({
      environment: searchParams.get('environment') || undefined,
      state: searchParams.get('state') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      type: searchParams.get('type') || undefined,
    })

    const result = await featureFlagService.getFeatureFlags({
      ...filters,
      page: 1,
      limit: 50,
    })

    return NextResponse.json({ flags: result.data, total: result.total })
  } catch (error: any) {
    return featureFlagService.handleError(error)
  }
}

// POST /api/feature-flags - Create a new feature flag
export async function POST(request: NextRequest) {
  try {
    // Apply authentication and authorization
    const user = await featureFlagService.requireAuthAndPermission(PERMISSIONS.FLAG_WRITE)

    // Apply rate limiting
    const rateLimitResponse = await featureFlagService.applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const data = featureFlagCreateSchema.parse(body)

    const flag = await featureFlagService.createFeatureFlag({
      ...data,
      ownerId: user.id,
    })

    return NextResponse.json({ flag }, { status: 201 })
  } catch (error: any) {
    return featureFlagService.handleError(error)
  }
}
