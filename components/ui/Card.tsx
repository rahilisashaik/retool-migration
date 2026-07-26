import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, padding = true }) => {
  return (
    <div className={`bg-brand-darker rounded-xl border border-brand-green/10 shadow-lg ${padding ? 'p-6' : ''} ${hover ? 'hover:border-brand-green/30 hover:shadow-xl transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`p-6 border-b border-brand-green/10 ${className}`}>{children}</div>
}

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`p-6 border-t border-brand-green/10 ${className}`}>{children}</div>
}
