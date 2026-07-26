import React from 'react'

interface PoweredByFooterProps {
  brand?: string
  className?: string
}

export const PoweredByFooter: React.FC<PoweredByFooterProps> = ({ 
  brand = 'Devin',
  className = '' 
}) => {
  return (
    <div className={`powered-by ${className}`}>
      <p className="powered-by-text">
        Powered by{' '}
        <span className="powered-by-brand">{brand}</span>
      </p>
    </div>
  )
}
