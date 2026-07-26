import React from 'react'
import Link from 'next/link'

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  icon?: string
  Icon?: React.ComponentType<{ className?: string }>
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  variant = 'full', 
  size = 'md',
  className = '',
  href = '/dashboard',
  icon = '🍞',
  Icon
}) => {
  const sizes = {
    sm: { icon: 'text-xl', text: 'text-lg', svg: 'w-5 h-5' },
    md: { icon: 'text-2xl', text: 'text-xl', svg: 'w-6 h-6' },
    lg: { icon: 'text-3xl', text: 'text-2xl', svg: 'w-8 h-8' },
  }

  const sizeClasses = sizes[size]

  const content = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {Icon ? (
        <Icon className={sizeClasses.svg} />
      ) : (
        <span className={sizeClasses.icon}>{icon}</span>
      )}
      {variant !== 'icon' && (
        <span className={`${sizeClasses.text} font-bold text-white`}>
          <span className="text-brand-green">Bread</span> AI
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
