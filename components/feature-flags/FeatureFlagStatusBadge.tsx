import { Badge } from '@/components/ui/Badge'

interface FeatureFlagStatusBadgeProps {
  state: string
}

export function FeatureFlagStatusBadge({ state }: FeatureFlagStatusBadgeProps) {
  const getVariant = (state: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (state.toUpperCase()) {
      case 'ENABLED':
        return 'success'
      case 'DISABLED':
        return 'default'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant(state)}>{state}</Badge>
}
