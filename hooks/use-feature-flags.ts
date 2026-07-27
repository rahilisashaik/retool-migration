'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
export interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  environment: string
  type: string
  state: string
  rolloutPercentage: number
  targetSegment: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  owner?: {
    id: string
    name: string
    email: string
  }
  changes?: FeatureFlagChange[]
}

export interface FeatureFlagChange {
  id: string
  flagId: string
  actorId: string
  field: string
  oldValue: string
  newValue: string
  reason: string | null
  createdAt: string
  actor?: {
    id: string
    name: string
    email: string
  }
}

export interface FeatureFlagFilters {
  environment?: string
  state?: string
  ownerId?: string
  type?: string
}

export interface FeatureFlagCreateData {
  key: string
  name: string
  description?: string
  environment: string
  type: string
  state?: string
  rolloutPercentage?: number
  targetSegment?: string
}

export interface FeatureFlagUpdateData {
  name?: string
  description?: string
  state?: string
  rolloutPercentage?: number
  targetSegment?: string
  reason?: string
}

// API client functions
async function fetchFeatureFlags(filters?: FeatureFlagFilters): Promise<FeatureFlag[]> {
  const params = new URLSearchParams()
  if (filters?.environment) params.append('environment', filters.environment)
  if (filters?.state) params.append('state', filters.state)
  if (filters?.ownerId) params.append('ownerId', filters.ownerId)
  if (filters?.type) params.append('type', filters.type)

  const response = await fetch(`/api/feature-flags?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch feature flags')
  }
  const data = await response.json()
  return data.flags
}

async function fetchFeatureFlag(id: string): Promise<FeatureFlag> {
  const response = await fetch(`/api/feature-flags/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch feature flag')
  }
  const data = await response.json()
  return data.flag
}

async function createFeatureFlag(data: FeatureFlagCreateData): Promise<FeatureFlag> {
  const response = await fetch('/api/feature-flags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || errorData.details || 'Failed to create feature flag')
  }
  const result = await response.json()
  return result.flag
}

async function updateFeatureFlag(id: string, data: FeatureFlagUpdateData): Promise<FeatureFlag> {
  const response = await fetch(`/api/feature-flags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update feature flag')
  }
  const result = await response.json()
  return result.flag
}

async function deleteFeatureFlag(id: string): Promise<void> {
  const response = await fetch(`/api/feature-flags/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete feature flag')
  }
}

// Hooks
export function useFeatureFlags(filters?: FeatureFlagFilters) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['feature-flags', filters],
    queryFn: () => fetchFeatureFlags(filters),
    enabled: !!session,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  })
}

export function useFeatureFlag(id: string) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['feature-flag', id],
    queryFn: () => fetchFeatureFlag(id),
    enabled: !!session && !!id,
    staleTime: 0,
  })
}

export function useFeatureFlagCreate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: FeatureFlagCreateData) => createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
      queryClient.refetchQueries({ queryKey: ['feature-flags'] })
    },
  })
}

export function useFeatureFlagUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeatureFlagUpdateData }) =>
      updateFeatureFlag(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
      queryClient.invalidateQueries({ queryKey: ['feature-flag', variables.id] })
      queryClient.refetchQueries({ queryKey: ['feature-flags'] })
      queryClient.refetchQueries({ queryKey: ['feature-flag', variables.id] })
    },
  })
}

export function useFeatureFlagDelete() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
      queryClient.refetchQueries({ queryKey: ['feature-flags'] })
    },
  })
}
