import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface InfoFieldProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  iconColor?: string
  className?: string
}

export function InfoField({
  label,
  value,
  icon: Icon,
  iconColor = 'text-gray-400',
  className = '',
}: InfoFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="flex items-center gap-2 text-white">
        {Icon && <Icon size={16} className={iconColor} />}
        <span className="break-all">{value}</span>
      </div>
    </div>
  )
}
