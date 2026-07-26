import React from 'react'
import { Card, CardHeader, CardContent } from './Card'
import { Button } from './Button'

interface QuickAccessCardProps {
  title: string
  description: string
  icon?: string
  Icon?: React.ComponentType<{ className?: string }>
  buttonText: string
  onClick?: () => void
  className?: string
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  title,
  description,
  icon,
  Icon,
  buttonText,
  onClick,
  className = ''
}) => {
  return (
    <Card hover className={`group cursor-pointer ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="text-2xl group-hover:scale-110 transition-transform">
            {Icon ? <Icon className="text-brand-green" /> : icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 text-sm mb-4">
          {description}
        </p>
        <Button variant="secondary" className="w-full" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}
