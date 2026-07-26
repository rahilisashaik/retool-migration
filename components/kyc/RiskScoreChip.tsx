import { Badge } from '@/components/ui/Badge'

interface RiskScoreChipProps {
  score: number
}

export function RiskScoreChip({ score }: RiskScoreChipProps) {
  const getVariant = (score: number): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    if (score >= 80) return 'danger'
    if (score >= 50) return 'warning'
    if (score >= 20) return 'warning'
    return 'success'
  }

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'High'
    if (score >= 50) return 'Medium'
    if (score >= 20) return 'Low'
    return 'Very Low'
  }

  return (
    <Badge variant={getVariant(score)}>
      <span className="font-bold">{score}</span>
      <span className="ml-1">{getRiskLabel(score)}</span>
    </Badge>
  )
}
