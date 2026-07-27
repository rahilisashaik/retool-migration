'use client'

import { useState } from 'react'
import { FilterBar, FilterConfig } from '@/components/ui'

interface FeatureFlagFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function FeatureFlagFilters({ onFiltersChange }: FeatureFlagFiltersProps) {
  const [values, setValues] = useState<Record<string, any>>({
    environment: '',
    state: '',
    type: '',
  })

  const filterConfigs: FilterConfig[] = [
    {
      type: 'select',
      name: 'environment',
      label: 'Environment',
      options: [
        { value: '', label: 'All Environments' },
        { value: 'PRODUCTION', label: 'Production' },
        { value: 'STAGING', label: 'Staging' },
      ],
    },
    {
      type: 'select',
      name: 'state',
      label: 'State',
      options: [
        { value: '', label: 'All States' },
        { value: 'ENABLED', label: 'Enabled' },
        { value: 'DISABLED', label: 'Disabled' },
      ],
    },
    {
      type: 'select',
      name: 'type',
      label: 'Type',
      options: [
        { value: '', label: 'All Types' },
        { value: 'BOOLEAN', label: 'Boolean' },
        { value: 'PERCENTAGE', label: 'Percentage' },
        { value: 'SEGMENT', label: 'Segment' },
      ],
    },
  ]

  const handleApply = () => {
    const filters: any = {}
    
    if (values.environment) filters.environment = values.environment
    if (values.state) filters.state = values.state
    if (values.type) filters.type = values.type
    
    onFiltersChange(filters)
  }

  const handleClear = () => {
    const clearedValues: Record<string, any> = {
      environment: '',
      state: '',
      type: '',
    }
    setValues(clearedValues)
    onFiltersChange({})
  }

  return (
    <FilterBar
      filters={filterConfigs}
      values={values}
      onChange={setValues}
      onApply={handleApply}
      onClear={handleClear}
    />
  )
}
