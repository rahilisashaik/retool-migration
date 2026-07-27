'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { StatCard } from '@/components/ui/StatCard'
import { QuickAccessCard } from '@/components/ui/QuickAccessCard'
import { UserProfileCard } from '@/components/ui/UserProfileCard'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { Search, DollarSign, Flag, Activity } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: stats, isLoading, error } = useDashboardStats()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="page-container centered-content">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const displayStats = stats || {
    openKycCases: 0,
    pendingRefunds: 0,
    activeFlags: 0,
    recentActivity: 0,
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        {/* Welcome Section */}
        <div className="page-header">
          <h1 className="welcome-header">
            {session.user.name}
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="stat-grid">
          <StatCard
            label="Open KYC Cases"
            value={displayStats.openKycCases.toString()}
            Icon={Search}
          />
          <StatCard
            label="Pending Refunds"
            value={displayStats.pendingRefunds.toString()}
            Icon={DollarSign}
          />
          <StatCard
            label="Active Flags"
            value={displayStats.activeFlags.toString()}
            Icon={Flag}
          />
          <StatCard
            label="Recent Activity"
            value={displayStats.recentActivity.toString()}
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