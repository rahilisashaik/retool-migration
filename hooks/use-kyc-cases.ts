'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
export interface KycCase {
  id: string
  customerId: string
  status: string
  riskScore: number
  submittedAt: string
  reviewedAt: string | null
  reviewerId: string | null
  documents: string | null
  createdAt: string
  updatedAt: string
  reviewer?: {
    id: string
    name: string
    email: string
  }
  notes?: KycNote[]
  linkedRefunds?: RefundRequest[]
}

export interface KycNote {
  id: string
  caseId: string
  authorId: string
  body: string
  createdAt: string
  author?: {
    id: string
    name: string
    email: string
  }
}

export interface RefundRequest {
  id: string
  orderId: string
  customerId: string
  amount: number
  currency: string
  reason: string
  status: string
  kycCaseId: string | null
  createdAt: string
  updatedAt: string
}

export interface KycCaseFilters {
  status?: string
  minRiskScore?: number
  maxRiskScore?: number
  assigneeId?: string
  fromDate?: string
  toDate?: string
}

// API client functions
async function fetchKycCases(filters?: KycCaseFilters): Promise<KycCase[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.minRiskScore) params.append('minRiskScore', filters.minRiskScore.toString())
  if (filters?.maxRiskScore) params.append('maxRiskScore', filters.maxRiskScore.toString())
  if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)

  const response = await fetch(`/api/kyc?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch KYC cases')
  }
  const data = await response.json()
  return data.cases
}

async function fetchKycCase(id: string): Promise<KycCase> {
  const response = await fetch(`/api/kyc/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch KYC case')
  }
  const data = await response.json()
  return data.case
}

async function transitionKycCase(id: string, status: string, reason: string): Promise<KycCase> {
  const response = await fetch(`/api/kyc/${id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason }),
  })
  if (!response.ok) {
    throw new Error('Failed to transition KYC case')
  }
  const data = await response.json()
  return data.case
}

async function addKycNote(id: string, body: string): Promise<KycNote> {
  const response = await fetch(`/api/kyc/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
  if (!response.ok) {
    throw new Error('Failed to add note')
  }
  const data = await response.json()
  return data.note
}

// Hooks
export function useKycCases(filters?: KycCaseFilters) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['kyc-cases', filters],
    queryFn: () => fetchKycCases(filters),
    enabled: !!session,
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useKycCase(id: string) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['kyc-case', id],
    queryFn: () => fetchKycCase(id),
    enabled: !!session && !!id,
  })
}

export function useKycCaseTransition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason: string }) =>
      transitionKycCase(id, status, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-cases'] })
      queryClient.invalidateQueries({ queryKey: ['kyc-case', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useKycNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => addKycNote(id, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kyc-case', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['kyc-cases'] })
    },
  })
}
