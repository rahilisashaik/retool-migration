'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Button, Input, Card } from '@/components/ui'
import { useFeatureFlagCreate } from '@/hooks/use-feature-flags'
import { Settings, ArrowLeft, Save } from 'lucide-react'

export default function NewFeatureFlagPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({
    key: '',
    name: '',
    description: '',
    environment: 'STAGING',
    type: 'BOOLEAN',
    state: 'DISABLED',
    rolloutPercentage: 0,
    targetSegment: '',
  })

  const createMutation = useFeatureFlagCreate()

  if (!session) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await createMutation.mutateAsync(form)
      router.push(`/feature-flags/${result.id}`)
    } catch (error: any) {
      console.error('Failed to create flag:', error)
      alert(`Failed to create flag: ${error.message || 'Unknown error'}`)
    }
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

          <div className="flex items-center gap-3">
            <Settings size={32} className="text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Create Feature Flag</h1>
              <p className="text-gray-400 mt-1">
                Set up a new feature flag for your application
              </p>
            </div>
          </div>
        </div>

        <Card className="max-w-8xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                placeholder="e.g. new_dashboard_ui"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Lowercase alphanumeric with underscores only</p>
            </div>
            
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. New Dashboard UI"
              required
            />
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what this flag controls..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Environment</label>
              <select
                value={form.environment}
                onChange={(e) => setForm({ ...form, environment: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="BOOLEAN">Boolean (On/Off)</option>
                <option value="PERCENTAGE">Percentage Rollout</option>
                <option value="SEGMENT">Segment-based</option>
              </select>
            </div>

            {form.type === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Initial Rollout: {form.rolloutPercentage}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.rolloutPercentage}
                  onChange={(e) => setForm({ ...form, rolloutPercentage: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}

            {form.type === 'SEGMENT' && (
              <Input
                label="Target Segment"
                value={form.targetSegment}
                onChange={(e) => setForm({ ...form, targetSegment: e.target.value })}
                placeholder="e.g. beta_testers, premium_users"
              />
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Initial State</label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="DISABLED">Disabled</option>
                <option value="ENABLED">Enabled</option>
              </select>
            </div>

            <div className="flex gap-4 pt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/feature-flags')}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending}
              >
                <Save size={16} className="mr-2" />
                {createMutation.isPending ? 'Creating...' : 'Create Flag'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
