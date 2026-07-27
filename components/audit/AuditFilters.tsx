'use client'

import { useState } from 'react'
import { FilterBar, FilterConfig } from '@/components/ui'

interface AuditFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function AuditFilters({ onFiltersChange }: AuditFiltersProps) {
  const [values, setValues] = useState<Record<string, any>>({
    action: '',
    resourceType: '',
    fromDate: '',
    toDate: '',
  })

  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      name: 'action',
      label: 'Action',
      placeholder: 'e.g., CREATE, UPDATE, DELETE',
    },
    {
      type: 'text',
      name: 'resourceType',
      label: 'Resource Type',
      placeholder: 'e.g., KycCase, RefundRequest',
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
    
    if (values.action) filters.action = values.action
    if (values.resourceType) filters.resourceType = values.resourceType
    if (values.fromDate) filters.fromDate = values.fromDate
    if (values.toDate) filters.toDate = values.toDate
    
    onFiltersChange(filters)
  }

  const handleClear = () => {
    const clearedValues: Record<string, any> = {
      action: '',
      resourceType: '',
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
