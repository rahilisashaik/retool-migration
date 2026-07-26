import { Badge } from '@/components/ui/Badge'

interface KycStatusBadgeProps {
  status: string
}

export function KycStatusBadge({ status }: KycStatusBadgeProps) {
  const getVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'warning'
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'danger'
      case 'ESCALATED':
        return 'warning'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant(status)}>{status}</Badge>
}
