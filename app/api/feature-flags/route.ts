import { NextRequest, NextResponse } from 'next/server'
import { featureFlagFilterSchema, featureFlagCreateSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { featureFlagService } from '@/lib/services/feature-flag.service'
import { withGetHandler, withMutationHandler, parseQueryParams } from '@/lib/api-wrapper'

// GET /api/feature-flags - List feature flags with filters
export const GET = withGetHandler({
  permission: PERMISSIONS.FLAG_READ,
  service: featureFlagService
}, async (request: NextRequest, { user }: { user?: any }) => {
  const filters = parseQueryParams(request, featureFlagFilterSchema)

  const result = await featureFlagService.getFeatureFlags({
    ...filters,
    page: 1,
    limit: 50,
  })

  return NextResponse.json({ flags: result.data, total: result.total })
})

// POST /api/feature-flags - Create a new feature flag
export const POST = withMutationHandler({
  permission: PERMISSIONS.FLAG_WRITE,
  service: featureFlagService
}, async (request: NextRequest, { user }: { user?: any }) => {
  const body = await request.json()
  const data = featureFlagCreateSchema.parse(body)

  const flag = await featureFlagService.createFeatureFlag({
    ...data,
    ownerId: user.id,
  })

  return NextResponse.json({ flag }, { status: 201 })
})
