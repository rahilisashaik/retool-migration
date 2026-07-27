import { Badge } from '@/components/ui/Badge'

interface RefundStatusBadgeProps {
  status: string
}

export function RefundStatusBadge({ status }: RefundStatusBadgeProps) {
  const getVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'warning'
      case 'APPROVED':
        return 'success'
      case 'DENIED':
        return 'danger'
      case 'ON_HOLD':
        return 'info'
      case 'PROCESSED':
        return 'success'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant(status)}>{status}</Badge>
}
