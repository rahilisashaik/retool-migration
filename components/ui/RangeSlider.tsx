'use client'

import React from 'react'

export interface RangeSliderProps {
  label?: string
  min?: number
  max?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  className?: string
}

const RangeSliderInternal: React.FC<RangeSliderProps> = ({
  label,
  min = 0,
  max = 100,
  value,
  onChange,
  step = 1,
  className = '',
}) => {
  const [minValue, maxValue] = value

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value)
    if (newMin <= maxValue) {
      onChange([newMin, maxValue])
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value)
    if (newMax >= minValue) {
      onChange([minValue, newMax])
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={handleMinChange}
            placeholder="Min"
            className="w-full px-4 py-3 bg-input border border-brand-green/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={handleMaxChange}
            placeholder="Max"
            className="w-full px-4 py-3 bg-input border border-brand-green/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div className="relative h-2 bg-brand-darker rounded-full mt-2">
        <div
          className="absolute h-full bg-brand-green rounded-full"
          style={{
            left: `${((minValue - min) / (max - min)) * 100}%`,
            width: `${((maxValue - minValue) / (max - min)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

export const RangeSlider = RangeSliderInternal
