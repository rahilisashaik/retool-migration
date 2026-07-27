'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { FeatureFlagFilters } from '@/components/feature-flags/FeatureFlagFilters'
import { FeatureFlagStatusBadge } from '@/components/feature-flags/FeatureFlagStatusBadge'
import { FeatureFlagTypeBadge } from '@/components/feature-flags/FeatureFlagTypeBadge'
import { FeatureFlagEnvironmentBadge } from '@/components/feature-flags/FeatureFlagEnvironmentBadge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, Modal } from '@/components/ui'
import { PageHeader, StateContainer, TableContainer } from '@/components/shared'
import { useFeatureFlags, useFeatureFlagDelete } from '@/hooks/use-feature-flags'
import { Settings, User, Calendar, AlertTriangle, Trash2 } from 'lucide-react'
import { formatDate, formatDateString } from '@/lib/utils/formatters'

export default function FeatureFlagsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [filters, setFilters] = useState<any>({})
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [flagToDelete, setFlagToDelete] = useState<string | null>(null)

  const { data: flags, isLoading, error } = useFeatureFlags(filters)
  const deleteMutation = useFeatureFlagDelete()

  const handleDelete = async () => {
    if (flagToDelete) {
      await deleteMutation.mutateAsync(flagToDelete)
      setDeleteModalOpen(false)
      setFlagToDelete(null)
    }
  }

  const openDeleteModal = (id: string) => {
    setFlagToDelete(id)
    setDeleteModalOpen(true)
  }

  if (!session) {
    return null
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <PageHeader
          title="Feature Flags"
          description="Manage feature flags and rollout configurations"
          icon={Settings}
          iconColor="text-purple-400"
          action={
            <Button onClick={() => router.push('/feature-flags/new')}>
              Create Flag
            </Button>
          }
        />

        <FeatureFlagFilters onFiltersChange={setFilters} />

        <StateContainer
          isLoading={isLoading}
          error={error}
          isEmpty={!flags || flags.length === 0}
          loadingMessage="Loading feature flags..."
          errorMessage="Error loading feature flags. Please try again."
          emptyMessage="No Feature Flags Found"
          emptyDescription="There are no feature flags configured."
          hasActiveFilters={Object.keys(filters).length > 0}
        >
          <TableContainer
            columns={[
              { key: 'key', header: 'Key', className: 'px-4 py-3' },
              { key: 'name', header: 'Name', className: 'px-4 py-3' },
              { key: 'type', header: 'Type', className: 'px-4 py-3' },
              { key: 'environment', header: 'Environment', className: 'px-4 py-3' },
              { key: 'state', header: 'State', className: 'px-4 py-3' },
              { key: 'rollout', header: 'Rollout', className: 'px-4 py-3' },
              { key: 'owner', header: 'Owner', className: 'px-4 py-3' },
              { key: 'created', header: 'Created', className: 'px-4 py-3' },
              { key: 'actions', header: 'Actions', className: 'px-4 py-3' },
            ]}
          >
            {flags?.map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="px-4 py-3">
                  <span className="font-mono text-sm">{flag.key}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div>
                    <div className="font-medium text-white">{flag.name}</div>
                    {flag.description && (
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {flag.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <FeatureFlagTypeBadge type={flag.type} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <FeatureFlagEnvironmentBadge environment={flag.environment} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <FeatureFlagStatusBadge state={flag.state} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  {flag.type === 'PERCENTAGE' ? (
                    <span className="text-sm text-gray-300">
                      {flag.rolloutPercentage}%
                    </span>
                  ) : flag.type === 'SEGMENT' ? (
                    <span className="text-sm text-gray-300 break-all">
                      {flag.targetSegment || 'N/A'}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {flag.owner?.name || 'Unknown'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm">{formatDateString(flag.createdAt)}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/feature-flags/${flag.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteModal(flag.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableContainer>
        </StateContainer>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Feature Flag"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-300">
          Are you sure you want to delete this feature flag? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
