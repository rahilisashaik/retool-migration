import { z } from 'zod'
import { NextResponse } from 'next/server'

// Import Prisma enums for type-safe validation
import { UserRole, KycStatus, RefundStatus, Environment, FeatureFlagType, FeatureFlagState, NotificationType } from '@prisma/client'

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
  status: z.enum(Object.values(KycStatus) as [string, ...string[]]).optional(),
  minRiskScore: z.number().optional(),
  maxRiskScore: z.number().optional(),
  assigneeId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export const kycCaseTransitionSchema = z.object({
  status: z.enum(Object.values(KycStatus) as [string, ...string[]]),
  reason: z.string().min(1, 'Reason is required'),
})

export const kycNoteSchema = z.object({
  body: z.string().min(1, 'Note body is required'),
})

// Refund validation schemas
export const refundFilterSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.enum(Object.values(RefundStatus) as [string, ...string[]]).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  currency: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export const refundTransitionSchema = z.object({
  status: z.enum(Object.values(RefundStatus) as [string, ...string[]]),
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
  environment: z.enum(Object.values(Environment) as [string, ...string[]]).optional(),
  state: z.enum(Object.values(FeatureFlagState) as [string, ...string[]]).optional(),
  ownerId: z.string().optional(),
  type: z.enum(Object.values(FeatureFlagType) as [string, ...string[]]).optional(),
})

export const featureFlagCreateSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  environment: z.enum(Object.values(Environment) as [string, ...string[]]),
  type: z.enum(Object.values(FeatureFlagType) as [string, ...string[]]),
  state: z.enum(Object.values(FeatureFlagState) as [string, ...string[]]).optional(),
  rolloutPercentage: z.number().min(0).max(100).default(0),
  targetSegment: z.string().optional(),
})

export const featureFlagUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  state: z.enum(Object.values(FeatureFlagState) as [string, ...string[]]).optional(),
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
