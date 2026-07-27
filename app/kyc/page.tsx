'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { KycFilters } from '@/components/kyc/KycFilters'
import { KycStatusBadge } from '@/components/kyc/KycStatusBadge'
import { RiskScoreChip } from '@/components/kyc/RiskScoreChip'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui'
import { PageHeader, StateContainer, TableContainer } from '@/components/shared'
import { useKycCases } from '@/hooks/use-kyc-cases'
import { Search, User, Calendar, AlertTriangle } from 'lucide-react'
import { formatDateString } from '@/lib/utils/formatters'

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
        <PageHeader
          title="KYC Review Queue"
          description="Review and manage customer identity verification cases"
          icon={Search}
          iconColor="text-blue-400"
        />

        <KycFilters onFiltersChange={setFilters} />

        <StateContainer
          isLoading={isLoading}
          error={error}
          isEmpty={!cases || cases.length === 0}
          loadingMessage="Loading KYC cases..."
          errorMessage="Error loading KYC cases. Please try again."
          emptyMessage="No KYC Cases Found"
          emptyDescription="There are no KYC cases in the queue."
          hasActiveFilters={Object.keys(filters).length > 0}
        >
          <TableContainer
            columns={[
              { key: 'customerId', header: 'Customer ID' },
              { key: 'status', header: 'Status' },
              { key: 'riskScore', header: 'Risk Score' },
              { key: 'submitted', header: 'Submitted' },
              { key: 'reviewer', header: 'Reviewer' },
              { key: 'actions', header: 'Actions' },
            ]}
          >
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
                    <span className="text-sm">{formatDateString(kycCase.submittedAt)}</span>
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
          </TableContainer>
        </StateContainer>
      </div>
    </div>
  )
}
