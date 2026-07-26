import React from 'react'

interface HoverIconProps {
  icon?: string
  Icon?: React.ComponentType<{ className?: string }>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animation?: 'float' | 'float-delayed' | 'float-delayed-2' | 'pulse-slow' | 'none'
  className?: string
  delay?: number
  withGlow?: boolean
}

export const HoverIcon: React.FC<HoverIconProps> = ({ 
  icon, 
  Icon,
  size = 'md', 
  animation = 'float',
  className = '',
  delay = 0,
  withGlow = true
}) => {
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
    xl: 'w-48 h-48 text-6xl',
  }

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-5xl',
  }

  const animations = {
    'float': 'animate-float',
    'float-delayed': 'animate-float-delayed',
    'float-delayed-2': 'animate-float-delayed-2',
    'pulse-slow': 'animate-pulse-slow',
    'none': '',
  }

  return (
    <div 
      className={`
        ${sizes[size]} 
        bg-gradient-to-br from-brand-green to-brand-greenDark 
        rounded-full 
        shadow-lg shadow-brand-green/20 
        flex items-center justify-center 
        relative 
        cursor-pointer 
        transition-all duration-300 
        hover:scale-125 
        hover:z-20 
        ${animations[animation]}
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-2 bg-brand-dark rounded-full flex items-center justify-center">
        {Icon ? (
          <Icon className={`${iconSizes[size]} text-white`} />
        ) : (
          <div className="text-white">{icon}</div>
        )}
      </div>
      {withGlow && (
        <div className="absolute -inset-4 bg-brand-green/20 rounded-full blur-xl animate-pulse-slow"></div>
      )}
    </div>
  )
}
