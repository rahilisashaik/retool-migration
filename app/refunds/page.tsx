'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { RefundFilters } from '@/components/refunds/RefundFilters'
import { RefundStatusBadge } from '@/components/refunds/RefundStatusBadge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from '@/components/ui'
import { useRefundRequests } from '@/hooks/use-refund-requests'
import { DollarSign, User, Calendar, AlertTriangle, Shield } from 'lucide-react'

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
        <div className="page-header">
          <div className="flex items-center gap-3">
            <DollarSign size={32} className="text-green-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Refunds Dashboard</h1>
              <p className="text-gray-400 mt-1">
                Search and manage refund requests
              </p>
            </div>
          </div>
        </div>

        <RefundFilters onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading refund requests...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading refund requests. Please try again.
          </div>
        ) : refunds && refunds.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
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
                          {refund.amount.toFixed(2)} {refund.currency}
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
                        <span className="text-sm">{new Date(refund.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/refunds/${refund.id}`)}
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
            <h3 className="text-xl font-semibold text-white mb-2">No Refund Requests Found</h3>
            <p className="text-gray-400">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'There are no refund requests in the queue.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
