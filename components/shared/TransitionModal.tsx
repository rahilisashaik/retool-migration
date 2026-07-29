import { Button, Input, Modal } from '@/components/ui'

interface TransitionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  reason: string
  onReasonChange: (reason: string) => void
  isPending: boolean
  confirmLabel?: string
}

export function TransitionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  reason,
  onReasonChange,
  isPending,
  confirmLabel = 'Confirm',
}: TransitionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? 'Processing...' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="py-2">
        <Input
          label="Reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Enter the reason for this action..."
        />
      </div>
    </Modal>
  )
}
