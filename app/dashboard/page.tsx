'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { StatCard } from '@/components/ui/StatCard'
import { QuickAccessCard } from '@/components/ui/QuickAccessCard'
import { UserProfileCard } from '@/components/ui/UserProfileCard'
import { Search, DollarSign, Flag, Activity } from 'lucide-react'

interface DashboardStats {
  openKycCases: number
  pendingRefunds: number
  activeFlags: number
  recentActivity: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    openKycCases: 0,
    pendingRefunds: 0,
    activeFlags: 0,
    recentActivity: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardStats()
    }
  }, [session])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
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
      
      setStats({
        openKycCases: kycData.cases?.length || 0,
        pendingRefunds: refundData.refunds?.length || 0,
        activeFlags: flagsData.flags?.length || 0,
        recentActivity: auditData.events?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set default values on error
      setStats({
        openKycCases: 0,
        pendingRefunds: 0,
        activeFlags: 0,
        recentActivity: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="page-container centered-content">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        {/* Welcome Section */}
        <div className="page-header">
          <h1 className="welcome-header">
            Welcome back, {session.user.name}!
          </h1>
          <p className="welcome-subtitle">
            Here's what's happening across the Bread AI platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stat-grid">
          <StatCard
            label="Open KYC Cases"
            value={stats.openKycCases.toString()}
            Icon={Search}
          />
          <StatCard
            label="Pending Refunds"
            value={stats.pendingRefunds.toString()}
            Icon={DollarSign}
          />
          <StatCard
            label="Active Flags"
            value={stats.activeFlags.toString()}
            Icon={Flag}
          />
          <StatCard
            label="Recent Activity"
            value={stats.recentActivity.toString()}
            Icon={Activity}
          />
        </div>

        {/* Quick Access */}
        <div className="page-header">
          <h2 className="section-header">Quick Access</h2>
          <div className="quick-access-grid">
            <QuickAccessCard
              title="KYC Review Queue"
              description="Manage customer identity verification cases and reviews"
              Icon={Search}
              buttonText="Open Queue"
              onClick={() => router.push('/kyc')}
            />
            <QuickAccessCard
              title="Refunds Dashboard"
              description="Process and track refund requests with KYC integration"
              Icon={DollarSign}
              buttonText="Open Dashboard"
              onClick={() => router.push('/refunds')}
            />
            <QuickAccessCard
              title="Feature Flags"
              description="Manage feature rollouts, experiments, and segment targeting"
              Icon={Flag}
              buttonText="Manage Flags"
              onClick={() => router.push('/feature-flags')}
            />
          </div>
        </div>

        {/* User Info Card */}
        <UserProfileCard
          email={session.user.email}
          role={session.user.role}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}