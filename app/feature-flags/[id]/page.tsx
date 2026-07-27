'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { FeatureFlagStatusBadge } from '@/components/feature-flags/FeatureFlagStatusBadge'
import { FeatureFlagTypeBadge } from '@/components/feature-flags/FeatureFlagTypeBadge'
import { FeatureFlagEnvironmentBadge } from '@/components/feature-flags/FeatureFlagEnvironmentBadge'
import { Button, Input, Card, Modal } from '@/components/ui'
import { useFeatureFlag, useFeatureFlagUpdate, useFeatureFlagDelete } from '@/hooks/use-feature-flags'
import { Settings, User, Calendar, FileText, ArrowLeft, Check, X, AlertTriangle, History, Trash2, Save } from 'lucide-react'

export default function FeatureFlagDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    state: '',
    rolloutPercentage: 0,
    targetSegment: '',
    reason: '',
  })

  const { data: flag, isLoading, error } = useFeatureFlag(params.id)
  const updateMutation = useFeatureFlagUpdate()
  const deleteMutation = useFeatureFlagDelete()

  if (!session) {
    return null
  }

  const handleEdit = () => {
    if (!flag) return
    setEditForm({
      name: flag.name,
      description: flag.description || '',
      state: flag.state,
      rolloutPercentage: flag.rolloutPercentage,
      targetSegment: flag.targetSegment || '',
      reason: '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!flag) return

    try {
      await updateMutation.mutate({
        id: flag.id,
        data: {
          name: editForm.name,
          description: editForm.description,
          state: editForm.state,
          rolloutPercentage: editForm.rolloutPercentage,
          targetSegment: editForm.targetSegment,
          reason: editForm.reason,
        },
      })
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update flag:', error)
    }
  }

  const handleToggleState = async () => {
    if (!flag) return

    try {
      await updateMutation.mutate({
        id: flag.id,
        data: {
          state: flag.state === 'ENABLED' ? 'DISABLED' : 'ENABLED',
          reason: `Toggled flag state to ${flag.state === 'ENABLED' ? 'DISABLED' : 'ENABLED'}`,
        },
      })
    } catch (error) {
      console.error('Failed to toggle flag state:', error)
    }
  }

  const handleDelete = async () => {
    if (!flag) return

    try {
      await deleteMutation.mutateAsync(flag.id)
      router.push('/feature-flags')
    } catch (error) {
      console.error('Failed to delete flag:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="text-center py-12 text-gray-400">
            Loading feature flag...
          </div>
        </div>
      </div>
    )
  }

  if (error || !flag) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading feature flag. Please try again.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/feature-flags')}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Flags
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Feature Flag Details</h1>
              <p className="text-gray-400 mt-1">
                Key: <span className="font-mono">{flag.key}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={flag.state === 'ENABLED' ? 'danger' : 'primary'}
                onClick={handleToggleState}
              >
                {flag.state === 'ENABLED' ? (
                  <>
                    <X size={16} className="mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Enable
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleEdit}
              >
                <Save size={16} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Flag Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Settings size={24} className="text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Flag Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Key</label>
                <span className="text-white font-mono break-all">{flag.key}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <span className="text-white break-all">{flag.name}</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <p className="text-white break-words">{flag.description || 'No description'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <FeatureFlagTypeBadge type={flag.type} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Environment</label>
                <FeatureFlagEnvironmentBadge environment={flag.environment} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <FeatureFlagStatusBadge state={flag.state} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Owner</label>
                <div className="flex items-center gap-2 text-white">
                  <User size={16} className="text-gray-400" />
                  <span className="break-all">{flag.owner?.name || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Created</label>
                <div className="flex items-center gap-2 text-white">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="break-all">{new Date(flag.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Last Updated</label>
                <div className="flex items-center gap-2 text-white">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="break-all">{new Date(flag.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-6">
              <FileText size={24} className="text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Rollout Configuration</h2>
            </div>

            <div className="space-y-6">
              {flag.type === 'BOOLEAN' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Current State</label>
                  <FeatureFlagStatusBadge state={flag.state} />
                  <p className="text-sm text-gray-500 mt-2">
                    Boolean flags are either fully enabled or disabled.
                  </p>
                </div>
              )}

              {flag.type === 'PERCENTAGE' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Rollout Percentage: {flag.rolloutPercentage}%
                  </label>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${flag.rolloutPercentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This flag is enabled for {flag.rolloutPercentage}% of users.
                  </p>
                </div>
              )}

              {flag.type === 'SEGMENT' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Segment</label>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <span className="text-white font-mono break-all">
                      {flag.targetSegment || 'No segment configured'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This flag is enabled for users matching the target segment.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Change History */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <History size={24} className="text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Change History</h2>
          </div>

          <div className="space-y-4">
            {flag.changes && flag.changes.length > 0 ? (
              flag.changes.map((change) => (
                <div key={change.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-white">{change.actor?.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(change.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-purple-400">{change.field}:</span>{' '}
                    <span className="line-through text-gray-500">{change.oldValue}</span> →{' '}
                    <span className="text-green-400">{change.newValue}</span>
                  </div>
                  {change.reason && (
                    <p className="text-sm text-gray-400 mt-2 italic">
                      Reason: {change.reason}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No changes recorded yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Feature Flag"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Flag name"
          />
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Flag description"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">State</label>
            <select
              value={editForm.state}
              onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ENABLED">Enabled</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
          {flag.type === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Rollout Percentage: {editForm.rolloutPercentage}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={editForm.rolloutPercentage}
                onChange={(e) => setEditForm({ ...editForm, rolloutPercentage: Number(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}
          {flag.type === 'SEGMENT' && (
            <Input
              label="Target Segment"
              value={editForm.targetSegment}
              onChange={(e) => setEditForm({ ...editForm, targetSegment: e.target.value })}
              placeholder="e.g. beta_testers, premium_users"
            />
          )}
          <Input
            label="Reason for Change"
            value={editForm.reason}
            onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
            placeholder="Enter the reason for this change..."
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Feature Flag"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
