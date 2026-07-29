import { useState } from 'react'

/**
 * Hook to manage transition modal state (for status changes, approvals, etc.)
 * Common pattern used in KYC and refund pages
 */
export function useTransitionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [transitionStatus, setTransitionStatus] = useState('')
  const [reason, setReason] = useState('')

  const open = (status: string) => {
    setTransitionStatus(status)
    setReason('')
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setTransitionStatus('')
    setReason('')
  }

  const updateReason = (newReason: string) => {
    setReason(newReason)
  }

  return {
    isOpen,
    transitionStatus,
    reason,
    open,
    close,
    updateReason,
  }
}
