'use client'

import { useSession } from 'next-auth/react'
import { KycStatusBadge } from '@/components/kyc/KycStatusBadge'
import { RiskScoreChip } from '@/components/kyc/RiskScoreChip'
import { Button, Card } from '@/components/ui'
import { DetailPageLayout, InfoField, NotesSection, TransitionModal, LoadingState, ErrorState } from '@/components/shared'
import { useKycCase, useKycCaseTransition, useKycNote } from '@/hooks/use-kyc-cases'
import { useTransitionModal } from '@/lib/hooks/use-transition-modal'
import { User, Calendar, FileText, Check, X, AlertTriangle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils/formatters'

export default function KycCaseDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const { data: kycCase, isLoading, error } = useKycCase(params.id)
  const transitionMutation = useKycCaseTransition()
  const noteMutation = useKycNote()
  const { isOpen, transitionStatus, reason, open, close, updateReason } = useTransitionModal()

  if (!session) {
    return null
  }

  const handleConfirmTransition = async () => {
    if (!reason.trim()) return

    try {
      await transitionMutation.mutate({
        id: params.id,
        status: transitionStatus,
        reason,
      })
      close()
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
    return <LoadingState message="Loading KYC case..." />
  }

  if (error || !kycCase) {
    return <ErrorState message="Error loading KYC case. Please try again." />
  }

  return (
    <>
      <DetailPageLayout
        backHref="/kyc"
        backLabel="Back to Queue"
        title="KYC Case Details"
        subtitle={`Customer ID: ${kycCase.customerId}`}
        actions={
          kycCase.reviewerId !== session.user.id && (
            <Button variant="secondary" onClick={handleAssignToMe}>
              Assign to Me
            </Button>
          )
        }
      >
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
                onClick={() => open('APPROVED')}
                disabled={kycCase.status === 'APPROVED'}
              >
                <Check size={16} className="mr-2" />
                Approve
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => open('REJECTED')}
                disabled={kycCase.status === 'REJECTED'}
              >
                <X size={16} className="mr-2" />
                Reject
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => open('ESCALATED')}
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
      </DetailPageLayout>

      <TransitionModal
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirmTransition}
        title={`Confirm ${transitionStatus}`}
        reason={reason}
        onReasonChange={updateReason}
        isPending={transitionMutation.isPending}
      />
    </>
  )
}
