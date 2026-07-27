'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { KycStatusBadge } from '@/components/kyc/KycStatusBadge'
import { RiskScoreChip } from '@/components/kyc/RiskScoreChip'
import { Button, Input, Card, Modal } from '@/components/ui'
import { BackButton, InfoField, NotesSection } from '@/components/shared'
import { useKycCase, useKycCaseTransition, useKycNote } from '@/hooks/use-kyc-cases'
import { User, Calendar, FileText, Check, X, AlertTriangle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils/formatters'

export default function KycCaseDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [showTransitionModal, setShowTransitionModal] = useState(false)
  const [transitionStatus, setTransitionStatus] = useState('')

  const { data: kycCase, isLoading, error } = useKycCase(params.id)
  const transitionMutation = useKycCaseTransition()
  const noteMutation = useKycNote()

  if (!session) {
    return null
  }

  const handleTransition = (status: string) => {
    setTransitionStatus(status)
    setShowTransitionModal(true)
  }

  const handleConfirmTransition = async () => {
    if (!reason.trim()) return

    try {
      await transitionMutation.mutate({
        id: params.id,
        status: transitionStatus,
        reason,
      })
      setShowTransitionModal(false)
      setReason('')
    } catch (error) {
      console.error('Failed to transition case:', error)
    }
  }

  const handleAddNote = async (body: string) => {
    if (!body.trim()) return

    try {
      await noteMutation.mutate({
        id: params.id,
        body,
      })
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleAssignToMe = async () => {
    if (!kycCase || kycCase.reviewerId === session.user.id) return

    try {
      await transitionMutation.mutate({
        id: params.id,
        status: kycCase.status,
        reason: 'Assigned to self',
      })
    } catch (error) {
      console.error('Failed to assign case:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="text-center py-12 text-gray-400">
            Loading KYC case...
          </div>
        </div>
      </div>
    )
  }

  if (error || !kycCase) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading KYC case. Please try again.
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
          <BackButton href="/kyc" label="Back to Queue" />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">KYC Case Details</h1>
              <p className="text-gray-400 mt-1">
                Customer ID: <span className="font-mono">{kycCase.customerId}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {kycCase.reviewerId !== session.user.id && (
                <Button
                  variant="secondary"
                  onClick={handleAssignToMe}
                >
                  Assign to Me
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Case Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <User size={24} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Case Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <KycStatusBadge status={kycCase.status} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Risk Score</label>
                <RiskScoreChip score={kycCase.riskScore} />
              </div>
              <InfoField
                label="Submitted"
                value={formatDate(kycCase.submittedAt)}
                icon={Calendar}
              />
              <InfoField
                label="Reviewed"
                value={kycCase.reviewedAt ? formatDate(kycCase.reviewedAt) : 'Not reviewed'}
                icon={Calendar}
              />
              <div>
                <label className="block text-sm text-gray-400 mb-2">Reviewer</label>
                <span className="text-white break-all">
                  {kycCase.reviewer?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Documents</label>
                <span className="text-white break-all">
                  {kycCase.documents || 'None'}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-6">
              <FileText size={24} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Actions</h2>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleTransition('APPROVED')}
                disabled={kycCase.status === 'APPROVED'}
              >
                <Check size={16} className="mr-2" />
                Approve
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleTransition('REJECTED')}
                disabled={kycCase.status === 'REJECTED'}
              >
                <X size={16} className="mr-2" />
                Reject
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleTransition('ESCALATED')}
                disabled={kycCase.status === 'ESCALATED'}
              >
                <AlertTriangle size={16} className="mr-2" />
                Escalate
              </Button>
            </div>
          </Card>
        </div>

        {/* Notes Section */}
        <NotesSection
          notes={kycCase.notes || []}
          onAddNote={handleAddNote}
          isAdding={noteMutation.isPending}
        />

        {/* Linked Refunds */}
        {kycCase.linkedRefunds && kycCase.linkedRefunds.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <FileText size={24} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Linked Refunds</h2>
            </div>

            <div className="space-y-4">
              {kycCase.linkedRefunds.map((refund) => (
                <div key={refund.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">Order: {refund.orderId}</span>
                      <span className="ml-4 text-gray-400">
                        Amount: {formatCurrency(refund.amount, refund.currency)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">{refund.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Transition Modal */}
      <Modal
        isOpen={showTransitionModal}
        onClose={() => {
          setShowTransitionModal(false)
          setReason('')
        }}
        title={`Confirm ${transitionStatus}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowTransitionModal(false)
                setReason('')
              }}
              disabled={transitionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmTransition}
              disabled={transitionMutation.isPending || !reason.trim()}
            >
              {transitionMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </>
        }
      >
        <div className="py-2">
          <Input
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for this action..."
          />
        </div>
      </Modal>
    </div>
  )
}
