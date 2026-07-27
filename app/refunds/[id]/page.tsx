'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { RefundStatusBadge } from '@/components/refunds/RefundStatusBadge'
import { Button, Input, Card, Modal, Select } from '@/components/ui'
import { useRefundRequest, useRefundTransition, useRefundNote, useRefundLinkKyc } from '@/hooks/use-refund-requests'
import { DollarSign, User, Calendar, FileText, ArrowLeft, Check, X, AlertTriangle, MessageSquare, Shield, Link } from 'lucide-react'

export default function RefundDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [showTransitionModal, setShowTransitionModal] = useState(false)
  const [transitionStatus, setTransitionStatus] = useState('')
  const [showLinkKycModal, setShowLinkKycModal] = useState(false)
  const [kycCaseId, setKycCaseId] = useState('')

  const { data: refund, isLoading, error } = useRefundRequest(params.id)
  const transitionMutation = useRefundTransition()
  const noteMutation = useRefundNote()
  const linkKycMutation = useRefundLinkKyc()

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
      console.error('Failed to transition refund:', error)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteBody.trim()) return

    try {
      await noteMutation.mutate({
        id: params.id,
        body: noteBody,
      })
      setNoteBody('')
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleLinkKyc = async () => {
    if (!kycCaseId.trim()) return

    try {
      await linkKycMutation.mutate({
        id: params.id,
        kycCaseId,
      })
      setShowLinkKycModal(false)
      setKycCaseId('')
    } catch (error) {
      console.error('Failed to link KYC case:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="text-center py-12 text-gray-400">
            Loading refund request...
          </div>
        </div>
      </div>
    )
  }

  if (error || !refund) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
            Error loading refund request. Please try again.
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
            onClick={() => router.push('/refunds')}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Refunds
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Refund Request Details</h1>
              <p className="text-gray-400 mt-1">
                Order ID: <span className="font-mono">{refund.orderId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign size={24} className="text-green-400" />
              <h2 className="text-xl font-semibold text-white">Refund Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Order ID</label>
                <span className="text-white font-mono break-all">{refund.orderId}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Customer ID</label>
                <div className="flex items-center gap-2 text-white">
                  <User size={16} className="text-gray-400" />
                  <span className="font-mono break-all">{refund.customerId}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                <div className="flex items-center gap-2 text-white">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="font-mono">{refund.amount.toFixed(2)} {refund.currency}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <RefundStatusBadge status={refund.status} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                <p className="text-white break-words">{refund.reason}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Submitted</label>
                <div className="flex items-center gap-2 text-white">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="break-all">{new Date(refund.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">KYC Case</label>
                {refund.kycCase ? (
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-400" />
                    <span className="text-white">
                      {refund.kycCase.status} (Risk: {refund.kycCase.riskScore})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Not linked</span>
                )}
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
                disabled={refund.status === 'APPROVED' || refund.status === 'PROCESSED'}
              >
                <Check size={16} className="mr-2" />
                Approve
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => handleTransition('DENIED')}
                disabled={refund.status === 'DENIED' || refund.status === 'PROCESSED'}
              >
                <X size={16} className="mr-2" />
                Deny
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleTransition('ON_HOLD')}
                disabled={refund.status === 'ON_HOLD' || refund.status === 'PROCESSED'}
              >
                <AlertTriangle size={16} className="mr-2" />
                Place on Hold
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowLinkKycModal(true)}
                disabled={!!refund.kycCaseId}
              >
                <Link size={16} className="mr-2" />
                Link to KYC Case
              </Button>
            </div>
          </Card>
        </div>

        {/* Notes Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Notes</h2>
          </div>

          <form onSubmit={handleAddNote} className="mb-6">
            <Input
              label="Add a note"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Enter your note..."
              className="mb-3"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={noteMutation.isPending}
            >
              {noteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </form>

          <div className="space-y-4">
            {refund.notes && refund.notes.length > 0 ? (
              refund.notes.map((note) => (
                <div key={note.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{note.author?.name}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 break-words">{note.body}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No notes yet</p>
            )}
          </div>
        </Card>
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

      {/* Link KYC Modal */}
      <Modal
        isOpen={showLinkKycModal}
        onClose={() => {
          setShowLinkKycModal(false)
          setKycCaseId('')
        }}
        title="Link to KYC Case"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowLinkKycModal(false)
                setKycCaseId('')
              }}
              disabled={linkKycMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLinkKyc}
              disabled={linkKycMutation.isPending || !kycCaseId.trim()}
            >
              {linkKycMutation.isPending ? 'Linking...' : 'Link'}
            </Button>
          </>
        }
      >
        <div className="py-2">
          <Input
            label="KYC Case ID"
            value={kycCaseId}
            onChange={(e) => setKycCaseId(e.target.value)}
            placeholder="Enter the KYC case ID..."
          />
        </div>
      </Modal>
    </div>
  )
}
