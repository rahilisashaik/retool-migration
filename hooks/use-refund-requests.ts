'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
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
  kycCase?: {
    id: string
    status: string
    riskScore: number
  }
  notes?: RefundNote[]
}

export interface RefundNote {
  id: string
  refundId: string
  authorId: string
  body: string
  createdAt: string
  author?: {
    id: string
    name: string
    email: string
  }
}

export interface RefundRequestFilters {
  orderId?: string
  customerId?: string
  status?: string
  minAmount?: number
  maxAmount?: number
  currency?: string
  fromDate?: string
  toDate?: string
}

// API client functions
async function fetchRefundRequests(filters?: RefundRequestFilters): Promise<RefundRequest[]> {
  const params = new URLSearchParams()
  if (filters?.orderId) params.append('orderId', filters.orderId)
  if (filters?.customerId) params.append('customerId', filters.customerId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString())
  if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString())
  if (filters?.currency) params.append('currency', filters.currency)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)

  const response = await fetch(`/api/refunds?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch refund requests')
  }
  const data = await response.json()
  return data.refunds
}

async function fetchRefundRequest(id: string): Promise<RefundRequest> {
  const response = await fetch(`/api/refunds/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch refund request')
  }
  const data = await response.json()
  return data.refund
}

async function transitionRefundRequest(id: string, status: string, reason: string): Promise<RefundRequest> {
  const response = await fetch(`/api/refunds/${id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason }),
  })
  if (!response.ok) {
    throw new Error('Failed to transition refund request')
  }
  const data = await response.json()
  return data.refund
}

async function addRefundNote(id: string, body: string): Promise<RefundNote> {
  const response = await fetch(`/api/refunds/${id}/notes`, {
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

async function linkRefundToKyc(id: string, kycCaseId: string): Promise<RefundRequest> {
  const response = await fetch(`/api/refunds/${id}/link-kyc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kycCaseId }),
  })
  if (!response.ok) {
    throw new Error('Failed to link refund to KYC case')
  }
  const data = await response.json()
  return data.refund
}

// Hooks
export function useRefundRequests(filters?: RefundRequestFilters) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['refund-requests', filters],
    queryFn: () => fetchRefundRequests(filters),
    enabled: !!session,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
  })
}

export function useRefundRequest(id: string) {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['refund-request', id],
    queryFn: () => fetchRefundRequest(id),
    enabled: !!session && !!id,
    staleTime: 0,
  })
}

export function useRefundTransition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason: string }) =>
      transitionRefundRequest(id, status, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['refund-request', data.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.refetchQueries({ queryKey: ['refund-requests'] })
      queryClient.refetchQueries({ queryKey: ['refund-request', data.id] })
    },
  })
}

export function useRefundNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => addRefundNote(id, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['refund-request', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
    },
  })
}

export function useRefundLinkKyc() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, kycCaseId }: { id: string; kycCaseId: string }) =>
      linkRefundToKyc(id, kycCaseId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['refund-request', data.id] })
      queryClient.invalidateQueries({ queryKey: ['kyc-cases'] })
      queryClient.invalidateQueries({ queryKey: ['kyc-case', variables.kycCaseId] })
    },
  })
}
