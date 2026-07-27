import { Badge } from '@/components/ui/Badge'

interface FeatureFlagTypeBadgeProps {
  type: string
}

export function FeatureFlagTypeBadge({ type }: FeatureFlagTypeBadgeProps) {
  const getVariant = (type: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (type.toUpperCase()) {
      case 'BOOLEAN':
        return 'info'
      case 'PERCENTAGE':
        return 'warning'
      case 'SEGMENT':
        return 'success'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant(type)}>{type}</Badge>
}
