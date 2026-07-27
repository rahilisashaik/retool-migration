'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/layout/Navigation'
import { AuditFilters } from '@/components/audit/AuditFilters'
import { AuditActionBadge } from '@/components/audit/AuditActionBadge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { PageHeader, StateContainer, TableContainer } from '@/components/shared'
import { useAuditLog } from '@/hooks/use-audit-log'
import { FileText, User, Calendar, AlertTriangle, ExternalLink, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'

export default function AuditLogPage() {
  const { data: session } = useSession()
  const [filters, setFilters] = useState<any>({})

  const { data: auditData, isLoading, error } = useAuditLog(filters)
  const events = auditData?.events || []
  const total = auditData?.total || 0

  if (!session) {
    return null
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <PageHeader
          title="Audit Log"
          description="View all system activity and changes"
          icon={FileText}
          iconColor="text-orange-400"
          metadata={total > 0 && (
            <div className="ml-auto text-sm text-gray-400">
              {total} events found
            </div>
          )}
        />

        <AuditFilters onFiltersChange={setFilters} />

        <StateContainer
          isLoading={isLoading}
          error={error}
          isEmpty={!events || events.length === 0}
          loadingMessage="Loading audit events..."
          errorMessage="Error loading audit events. Please try again."
          emptyMessage="No Audit Events Found"
          emptyDescription="There are no audit events recorded yet."
          hasActiveFilters={Object.keys(filters).length > 0}
        >
          <TableContainer
            columns={[
              { key: 'timestamp', header: 'Timestamp', className: 'px-4 py-3' },
              { key: 'action', header: 'Action', className: 'px-4 py-3' },
              { key: 'resourceType', header: 'Resource Type', className: 'px-4 py-3' },
              { key: 'resourceId', header: 'Resource ID', className: 'px-4 py-3' },
              { key: 'actor', header: 'Actor', className: 'px-4 py-3' },
              { key: 'ipAddress', header: 'IP Address', className: 'px-4 py-3' },
              { key: 'details', header: 'Details', className: 'px-4 py-3' },
            ]}
          >
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm">{formatDate(event.createdAt)}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <AuditActionBadge action={event.action} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-300">
                    {event.resourceType}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-300">
                    {event.resourceId}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300">
                        {event.actor?.name || 'Unknown'}
                      </span>
                      {event.actor?.email && (
                        <span className="text-xs text-gray-500">
                          {event.actor.email}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-400">
                    {event.ipAddress || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {event.metadata && Object.keys(event.metadata).length > 0 ? (
                    <details className="cursor-pointer">
                      <summary className="text-sm text-brand-green hover:text-brand-green/80 flex items-center gap-1">
                        <Shield size={14} />
                        View details
                      </summary>
                      <pre className="mt-2 text-xs bg-black/30 p-2 rounded overflow-x-auto max-w-xs">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <span className="text-sm text-gray-500">No details</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableContainer>
        </StateContainer>
      </div>
    </div>
  )
}
