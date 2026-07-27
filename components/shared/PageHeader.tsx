import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  action?: ReactNode
  metadata?: ReactNode
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-purple-400',
  action,
  metadata,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={32} className={iconColor} />}
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {metadata && <div className="mt-2">{metadata}</div>}
    </div>
  )
}
