'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/layout/Navigation'
import { AuditFilters } from '@/components/audit/AuditFilters'
import { AuditActionBadge } from '@/components/audit/AuditActionBadge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { useAuditLog } from '@/hooks/use-audit-log'
import { FileText, User, Calendar, AlertTriangle, ExternalLink, Shield } from 'lucide-react'

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
        <div className="page-header">
          <div className="flex items-center gap-3">
            <FileText size={32} className="text-orange-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Audit Log</h1>
              <p className="text-gray-400 mt-1">
                View all system activity and changes
              </p>
            </div>
          </div>
          {total > 0 && (
            <div className="ml-auto text-sm text-gray-400">
              {total} events found
            </div>
          )}
        </div>

        <AuditFilters onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading audit events...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading audit events. Please try again.
          </div>
        ) : events && events.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead className="px-4 py-3">Timestamp</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                  <TableHead className="px-4 py-3">Resource Type</TableHead>
                  <TableHead className="px-4 py-3">Resource ID</TableHead>
                  <TableHead className="px-4 py-3">Actor</TableHead>
                  <TableHead className="px-4 py-3">IP Address</TableHead>
                  <TableHead className="px-4 py-3">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
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
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
            <AlertTriangle size={48} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Audit Events Found</h3>
            <p className="text-gray-400">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'There are no audit events recorded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
