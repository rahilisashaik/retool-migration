import { NextRequest, NextResponse } from 'next/server'
import { featureFlagUpdateSchema } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { featureFlagService } from '@/lib/services/feature-flag.service'
import { withGetHandler, withMutationHandler } from '@/lib/api-wrapper'

// GET /api/feature-flags/[id] - Get a specific feature flag
export const GET = withGetHandler({
  permission: PERMISSIONS.FLAG_READ,
  service: featureFlagService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const flag = await featureFlagService.getFeatureFlagById(params.id)

  return NextResponse.json({ flag })
})

// PATCH /api/feature-flags/[id] - Update a feature flag
export const PATCH = withMutationHandler({
  permission: PERMISSIONS.FLAG_WRITE,
  service: featureFlagService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  const body = await request.json()
  const data = featureFlagUpdateSchema.parse(body)

  const updatedFlag = await featureFlagService.updateFeatureFlag(params.id, data, user.id)

  return NextResponse.json({ flag: updatedFlag })
})

// DELETE /api/feature-flags/[id] - Delete a feature flag
export const DELETE = withMutationHandler({
  permission: PERMISSIONS.FLAG_DELETE,
  service: featureFlagService
}, async (request: NextRequest, { user }: { user?: any }, { params }: { params: { id: string } }) => {
  await featureFlagService.deleteFeatureFlag(params.id, user.id)

  return NextResponse.json({ success: true })
})
