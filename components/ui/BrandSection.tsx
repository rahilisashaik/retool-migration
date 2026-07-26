import React from 'react'
import { BrandLogo } from './BrandLogo'
import { BreadIcon } from '../icons/BreadIcon'

interface BrandSectionProps {
  className?: string
}

export const BrandSection: React.FC<BrandSectionProps> = ({ className = '' }) => {
  return (
    <div className={`absolute bottom-8 left-8 ${className}`}>
      <BrandLogo variant="full" size="lg" href={undefined} Icon={BreadIcon} />
      <p className="text-gray-400 text-sm mt-2">Internal Platform</p>
    </div>
  )
}
