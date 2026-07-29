'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FeatureFlagFilters } from '@/components/feature-flags/FeatureFlagFilters'
import { FeatureFlagStatusBadge } from '@/components/feature-flags/FeatureFlagStatusBadge'
import { FeatureFlagTypeBadge } from '@/components/feature-flags/FeatureFlagTypeBadge'
import { FeatureFlagEnvironmentBadge } from '@/components/feature-flags/FeatureFlagEnvironmentBadge'
import { TableRow, TableCell, Button, Modal } from '@/components/ui'
import { ListPageLayout } from '@/components/shared'
import { useFeatureFlags, useFeatureFlagDelete } from '@/hooks/use-feature-flags'
import { useModalWithData } from '@/lib/hooks/use-modal-state'
import { Settings, User, Calendar, Trash2 } from 'lucide-react'
import { formatDateString } from '@/lib/utils/formatters'

export default function FeatureFlagsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [filters, setFilters] = useState<any>({})
  const { isOpen, data: flagToDelete, open, close } = useModalWithData<string>()

  const { data: flags, isLoading, error } = useFeatureFlags(filters)
  const deleteMutation = useFeatureFlagDelete()

  const handleDelete = async () => {
    if (flagToDelete) {
      await deleteMutation.mutateAsync(flagToDelete)
      close()
    }
  }

  if (!session) {
    return null
  }

  return (
    <>
      <ListPageLayout
        title="Feature Flags"
        description="Manage feature flags and rollout configurations"
        icon={Settings}
        iconColor="text-purple-400"
        action={
          <Button onClick={() => router.push('/feature-flags/new')}>
            Create Flag
          </Button>
        }
        filters={<FeatureFlagFilters onFiltersChange={setFilters} />}
        isLoading={isLoading}
        error={error}
        isEmpty={!flags || flags.length === 0}
        loadingMessage="Loading feature flags..."
        errorMessage="Error loading feature flags. Please try again."
        emptyMessage="No Feature Flags Found"
        emptyDescription="There are no feature flags configured."
        hasActiveFilters={Object.keys(filters).length > 0}
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
                  onClick={() => open(flag.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </ListPageLayout>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Delete Feature Flag"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
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
    </>
  )
}
