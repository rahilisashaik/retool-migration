'use client'

import React from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'
import { RangeSlider } from './RangeSlider'
import { DatePicker } from './DatePicker'
import { X } from 'lucide-react'

export interface FilterConfig {
  type: 'text' | 'select' | 'range' | 'date'
  name: string
  label: string
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
}

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onClear?: () => void
  onApply?: () => void
  showActions?: boolean
}

const FilterBarInternal: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onClear,
  onApply,
  showActions = true,
}) => {
  const handleFilterChange = (name: string, value: any) => {
    onChange({
      ...values,
      [name]: value,
    })
  }

  const handleClear = () => {
    const clearedValues: Record<string, any> = {}
    filters.forEach((filter) => {
      if (filter.type === 'range') {
        clearedValues[filter.name] = [filter.min || 0, filter.max || 100]
      } else {
        clearedValues[filter.name] = ''
      }
    })
    onChange(clearedValues)
    onClear?.()
  }

  const handleApply = () => {
    onApply?.()
  }

  const hasActiveFilters = Object.values(values).some(
    (value) => value !== '' && value !== undefined && value !== null
  )

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filters.map((filter) => {
          const value = values[filter.name]

          switch (filter.type) {
            case 'text':
              return (
                <Input
                  key={filter.name}
                  label={filter.label}
                  value={value || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  placeholder={filter.placeholder}
                />
              )

            case 'select':
              return (
                <Select
                  key={filter.name}
                  label={filter.label}
                  value={value || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  options={filter.options || [{ value: '', label: 'All' }]}
                />
              )

            case 'range':
              return (
                <RangeSlider
                  key={filter.name}
                  label={filter.label}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={value || [filter.min || 0, filter.max || 100]}
                  onChange={(newValue) => handleFilterChange(filter.name, newValue)}
                />
              )

            case 'date':
              return (
                <DatePicker
                  key={filter.name}
                  label={filter.label}
                  value={value || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                />
              )

            default:
              return null
          }
        })}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4">
          <Button variant="primary" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button
            variant="secondary"
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2"
          >
            <X size={16} />
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}

export const FilterBar = FilterBarInternal
