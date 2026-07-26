import React from 'react'
import { HoverIcon } from './HoverIcon'

interface AnimatedBreadBackgroundProps {
  className?: string
}

export const AnimatedBreadBackground: React.FC<AnimatedBreadBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`relative h-[600px] ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Main bread */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <HoverIcon 
              icon="🍞" 
              size="xl" 
              animation="float"
              className="hover:scale-110 hover:z-10 shadow-2xl shadow-brand-green/30"
            />
          </div>

          {/* Floating bread elements */}
          <div className="absolute top-1/4 left-1/4">
            <HoverIcon icon="🥐" size="md" animation="float-delayed" />
          </div>

          <div className="absolute top-1/3 right-1/4">
            <HoverIcon icon="🥖" size="lg" animation="float-delayed-2" />
          </div>

          <div className="absolute bottom-1/4 left-1/3">
            <HoverIcon icon="🥯" size="sm" animation="float" />
          </div>

          <div className="absolute bottom-1/3 right-1/3">
            <HoverIcon icon="🥨" size="sm" animation="float-delayed" />
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-green/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-brand-accent/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  )
}
