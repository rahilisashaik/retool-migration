'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
interface DashboardStats {
  openKycCases: number
  pendingRefunds: number
  activeFlags: number
  recentActivity: number
}

// API client functions
async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch KYC cases with PENDING status
    const kycResponse = await fetch('/api/kyc?status=PENDING')
    const kycData = await kycResponse.json()
    
    // Fetch refund requests with PENDING status
    const refundResponse = await fetch('/api/refunds?status=PENDING')
    const refundData = await refundResponse.json()
    
    // Fetch active feature flags
    const flagsResponse = await fetch('/api/feature-flags?state=ENABLED')
    const flagsData = await flagsResponse.json()
    
    // Fetch recent audit events (last 24 hours)
    const auditResponse = await fetch('/api/audit')
    const auditData = await auditResponse.json()
    
    return {
      openKycCases: kycData.cases?.length || 0,
      pendingRefunds: refundData.refunds?.length || 0,
      activeFlags: flagsData.flags?.length || 0,
      recentActivity: auditData.events?.length || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default values on error
    return {
      openKycCases: 0,
      pendingRefunds: 0,
      activeFlags: 0,
      recentActivity: 0,
    }
  }
}

// Hook
export function useDashboardStats() {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    enabled: !!session,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}
