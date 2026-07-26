import { NextRequest, NextResponse } from 'next/server'
import { featureFlagUpdateSchema, handleValidationError } from '@/lib/validations'
import { PERMISSIONS } from '@/lib/permissions'
import { featureFlagService } from '@/lib/services/feature-flag.service'

// GET /api/feature-flags/[id] - Get a specific feature flag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply authentication and authorization
    await featureFlagService.requireAuthAndPermission(PERMISSIONS.FLAG_READ)

    // Apply rate limiting
    const rateLimitResponse = await featureFlagService.applyRateLimit(request, 'READ')
    if (rateLimitResponse) return rateLimitResponse

    const flag = await featureFlagService.getFeatureFlagById(params.id)

    return NextResponse.json({ flag })
  } catch (error: any) {
    return featureFlagService.handleError(error)
  }
}

// PATCH /api/feature-flags/[id] - Update a feature flag
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply authentication and authorization
    const user = await featureFlagService.requireAuthAndPermission(PERMISSIONS.FLAG_WRITE)

    // Apply rate limiting
    const rateLimitResponse = await featureFlagService.applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const data = featureFlagUpdateSchema.parse(body)

    const updatedFlag = await featureFlagService.updateFeatureFlag(params.id, data, user.id)

    return NextResponse.json({ flag: updatedFlag })
  } catch (error: any) {
    return featureFlagService.handleError(error)
  }
}

// DELETE /api/feature-flags/[id] - Delete a feature flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apply authentication and authorization
    const user = await featureFlagService.requireAuthAndPermission(PERMISSIONS.FLAG_DELETE)

    // Apply rate limiting
    const rateLimitResponse = await featureFlagService.applyRateLimit(request, 'MUTATION')
    if (rateLimitResponse) return rateLimitResponse

    await featureFlagService.deleteFeatureFlag(params.id, user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return featureFlagService.handleError(error)
  }
}
