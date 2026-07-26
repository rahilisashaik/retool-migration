'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { KycFilters } from '@/components/kyc/KycFilters'
import { KycStatusBadge } from '@/components/kyc/KycStatusBadge'
import { RiskScoreChip } from '@/components/kyc/RiskScoreChip'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui'
import { useKycCases } from '@/hooks/use-kyc-cases'
import { Search, User, Calendar, AlertTriangle } from 'lucide-react'

export default function KycQueuePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [filters, setFilters] = useState<any>({})

  const { data: cases, isLoading, error } = useKycCases(filters)

  if (!session) {
    return null
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <Search size={32} className="text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">KYC Review Queue</h1>
              <p className="text-gray-400 mt-1">
                Review and manage customer identity verification cases
              </p>
            </div>
          </div>
        </div>

        <KycFilters onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading KYC cases...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading KYC cases. Please try again.
          </div>
        ) : cases && cases.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((kycCase) => (
                  <TableRow key={kycCase.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-mono text-sm">{kycCase.customerId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <KycStatusBadge status={kycCase.status} />
                    </TableCell>
                    <TableCell>
                      <RiskScoreChip score={kycCase.riskScore} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">{new Date(kycCase.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-300">
                        {kycCase.reviewer?.name || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/kyc/${kycCase.id}`)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
            <AlertTriangle size={48} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No KYC Cases Found</h3>
            <p className="text-gray-400">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'There are no KYC cases in the queue.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
