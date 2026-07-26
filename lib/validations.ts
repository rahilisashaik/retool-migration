import { z } from 'zod'
import { NextResponse } from 'next/server'

// Validation error handler
export function handleValidationError(error: any) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.errors 
      },
      { status: 400 }
    )
  }
  return null
}

// KYC validation schemas
export const kycCaseFilterSchema = z.object({
  status: z.string().optional(),
  minRiskScore: z.number().optional(),
  maxRiskScore: z.number().optional(),
  assigneeId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export const kycCaseTransitionSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED']),
  reason: z.string().min(1, 'Reason is required'),
})

export const kycNoteSchema = z.object({
  body: z.string().min(1, 'Note body is required'),
})

// Refund validation schemas
export const refundFilterSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  currency: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export const refundTransitionSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DENIED', 'ON_HOLD', 'PROCESSED']),
  reason: z.string().min(1, 'Reason is required'),
})

export const refundLinkKycSchema = z.object({
  kycCaseId: z.string().min(1, 'KYC case ID is required'),
})

export const refundNoteSchema = z.object({
  body: z.string().min(1, 'Note body is required'),
})

// Feature flag validation schemas
export const featureFlagFilterSchema = z.object({
  environment: z.string().optional(),
  state: z.string().optional(),
  ownerId: z.string().optional(),
  type: z.string().optional(),
})

export const featureFlagCreateSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  environment: z.enum(['PRODUCTION', 'STAGING']),
  type: z.enum(['BOOLEAN', 'PERCENTAGE', 'SEGMENT']),
  state: z.enum(['ENABLED', 'DISABLED']).default('DISABLED'),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  targetSegment: z.string().optional(),
})

export const featureFlagUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  state: z.enum(['ENABLED', 'DISABLED']).optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetSegment: z.string().optional(),
  reason: z.string().optional(),
})

export const featureFlagEvaluateSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  context: z.record(z.any()).optional(),
})

// Audit log validation schemas
export const auditLogFilterSchema = z.object({
  actorId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})
