'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { RefundFilters } from '@/components/refunds/RefundFilters'
import { RefundStatusBadge } from '@/components/refunds/RefundStatusBadge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui'
import { PageHeader, StateContainer, TableContainer } from '@/components/shared'
import { useRefundRequests } from '@/hooks/use-refund-requests'
import { DollarSign, User, Calendar, AlertTriangle, Shield } from 'lucide-react'
import { formatDateString, formatCurrency } from '@/lib/utils/formatters'

export default function RefundsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [filters, setFilters] = useState<any>({})

  const { data: refunds, isLoading, error } = useRefundRequests(filters)

  if (!session) {
    return null
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <PageHeader
          title="Refunds Dashboard"
          description="Search and manage refund requests"
          icon={DollarSign}
          iconColor="text-green-400"
        />

        <RefundFilters onFiltersChange={setFilters} />

        <StateContainer
          isLoading={isLoading}
          error={error}
          isEmpty={!refunds || refunds.length === 0}
          loadingMessage="Loading refund requests..."
          errorMessage="Error loading refund requests. Please try again."
          emptyMessage="No Refund Requests Found"
          emptyDescription="There are no refund requests in the queue."
          hasActiveFilters={Object.keys(filters).length > 0}
        >
          <TableContainer
            columns={[
              { key: 'orderId', header: 'Order ID' },
              { key: 'customerId', header: 'Customer ID' },
              { key: 'amount', header: 'Amount' },
              { key: 'status', header: 'Status' },
              { key: 'kycStatus', header: 'KYC Status' },
              { key: 'submitted', header: 'Submitted' },
              { key: 'actions', header: 'Actions' },
            ]}
          >
            {refunds?.map((refund) => (
              <TableRow key={refund.id}>
                <TableCell>
                  <span className="font-mono text-sm">{refund.orderId}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="font-mono text-sm">{refund.customerId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="font-mono text-sm">
                      {formatCurrency(refund.amount, refund.currency)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <RefundStatusBadge status={refund.status} />
                </TableCell>
                <TableCell>
                  {refund.kycCase ? (
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-blue-400" />
                      <span className="text-sm text-gray-300">
                        {refund.kycCase.status}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No KYC</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm">{formatDateString(refund.createdAt)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => router.push(`/refunds/${refund.id}`)}>
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
