import React from 'react'
import { Card, CardContent } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  icon?: string
  Icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon,
  Icon,
  className = '' 
}) => {
  return (
    <Card hover className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="text-3xl">
            {Icon ? <Icon className="text-brand-green" /> : icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
