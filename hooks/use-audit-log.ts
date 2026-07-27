'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
export interface AuditEvent {
  id: string
  actorId: string
  action: string
  resourceType: string
  resourceId: string
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  actor?: {
    id: string
    name: string
    email: string
  }
}

export interface AuditLogFilters {
  actorId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  fromDate?: string
  toDate?: string
}

// API client functions
async function fetchAuditEvents(filters?: AuditLogFilters): Promise<{ events: AuditEvent[]; total: number }> {
  const params = new URLSearchParams()
  if (filters?.actorId) params.append('actorId', filters.actorId)
  if (filters?.action) params.append('action', filters.action)
  if (filters?.resourceType) params.append('resourceType', filters.resourceType)
  if (filters?.resourceId) params.append('resourceId', filters.resourceId)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)

  const response = await fetch(`/api/audit?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch audit events')
  }
  return response.json()
}

// Hooks
export function useAuditLog(filters?: AuditLogFilters) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['audit-log', filters],
    queryFn: () => fetchAuditEvents(filters),
    enabled: !!session,
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  })
}
