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
import { useFeatureFlags, useFeatureFlagDelete } from '@/hooks/use-feature-flags'
import { Settings, User, Calendar, AlertTriangle, Trash2 } from 'lucide-react'

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
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings size={32} className="text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Feature Flags</h1>
                <p className="text-gray-400 mt-1">
                  Manage feature flags and rollout configurations
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/feature-flags/new')}>
              Create Flag
            </Button>
          </div>
        </div>

        <FeatureFlagFilters onFiltersChange={setFilters} />

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading feature flags...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading feature flags. Please try again.
          </div>
        ) : flags && flags.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead className="px-4 py-3">Key</TableHead>
                  <TableHead className="px-4 py-3">Name</TableHead>
                  <TableHead className="px-4 py-3">Type</TableHead>
                  <TableHead className="px-4 py-3">Environment</TableHead>
                  <TableHead className="px-4 py-3">State</TableHead>
                  <TableHead className="px-4 py-3">Rollout</TableHead>
                  <TableHead className="px-4 py-3">Owner</TableHead>
                  <TableHead className="px-4 py-3">Created</TableHead>
                  <TableHead className="px-4 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
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
                        <span className="text-sm">{new Date(flag.createdAt).toLocaleDateString()}</span>
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
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
            <AlertTriangle size={48} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Feature Flags Found</h3>
            <p className="text-gray-400">
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters to see more results.'
                : 'There are no feature flags configured.'}
            </p>
          </div>
        )}
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
