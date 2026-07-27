import { Badge } from '@/components/ui/Badge'

interface FeatureFlagEnvironmentBadgeProps {
  environment: string
}

export function FeatureFlagEnvironmentBadge({ environment }: FeatureFlagEnvironmentBadgeProps) {
  const getVariant = (environment: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (environment.toUpperCase()) {
      case 'PRODUCTION':
        return 'danger'
      case 'STAGING':
        return 'warning'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant(environment)}>{environment}</Badge>
}
