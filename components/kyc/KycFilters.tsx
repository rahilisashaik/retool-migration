'use client'

import { useState } from 'react'
import { FilterBar, FilterConfig } from '@/components/ui'

interface KycFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function KycFilters({ onFiltersChange }: KycFiltersProps) {
  const [values, setValues] = useState<Record<string, any>>({
    status: '',
    riskScore: [0, 100],
    fromDate: '',
    toDate: '',
  })

  const filterConfigs: FilterConfig[] = [
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'ESCALATED', label: 'Escalated' },
      ],
    },
    {
      type: 'range',
      name: 'riskScore',
      label: 'Risk Score',
      min: 0,
      max: 100,
      step: 1,
    },
    {
      type: 'date',
      name: 'fromDate',
      label: 'From Date',
    },
    {
      type: 'date',
      name: 'toDate',
      label: 'To Date',
    },
  ]

  const handleApply = () => {
    const filters: any = {}
    
    if (values.status) filters.status = values.status
    if (values.fromDate) filters.fromDate = values.fromDate
    if (values.toDate) filters.toDate = values.toDate
    if (values.riskScore) {
      const [min, max] = values.riskScore
      if (min > 0) filters.minRiskScore = min
      if (max < 100) filters.maxRiskScore = max
    }
    
    onFiltersChange(filters)
  }

  const handleClear = () => {
    const clearedValues: Record<string, any> = {
      status: '',
      riskScore: [0, 100],
      fromDate: '',
      toDate: '',
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
