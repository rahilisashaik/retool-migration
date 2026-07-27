'use client'

import { Badge } from '@/components/ui/Badge'

interface AuditActionBadgeProps {
  action: string
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  const getActionVariant = (action: string): 'success' | 'info' | 'danger' | 'warning' | 'default' => {
    const actionUpper = action.toUpperCase()
    
    switch (actionUpper) {
      case 'CREATE':
      case 'APPROVE':
        return 'success'
      case 'UPDATE':
      case 'TRANSITION':
        return 'info'
      case 'DELETE':
      case 'REJECT':
        return 'danger'
      case 'ESCALATE':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Badge variant={getActionVariant(action)}>
      {action}
    </Badge>
  )
}
