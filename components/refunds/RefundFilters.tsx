'use client'

import { useState } from 'react'
import { FilterBar, FilterConfig } from '@/components/ui'

interface RefundFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function RefundFilters({ onFiltersChange }: RefundFiltersProps) {
  const [values, setValues] = useState<Record<string, any>>({
    status: '',
    amount: [0, 10000],
    currency: 'USD',
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
        { value: 'DENIED', label: 'Denied' },
        { value: 'ON_HOLD', label: 'On Hold' },
        { value: 'PROCESSED', label: 'Processed' },
      ],
    },
    {
      type: 'range',
      name: 'amount',
      label: 'Amount Range',
      min: 0,
      max: 10000,
      step: 100,
    },
    {
      type: 'select',
      name: 'currency',
      label: 'Currency',
      options: [
        { value: '', label: 'All Currencies' },
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
      ],
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
    if (values.currency) filters.currency = values.currency
    if (values.fromDate) filters.fromDate = values.fromDate
    if (values.toDate) filters.toDate = values.toDate
    if (values.amount) {
      const [min, max] = values.amount
      if (min > 0) filters.minAmount = min
      if (max < 10000) filters.maxAmount = max
    }
    
    onFiltersChange(filters)
  }

  const handleClear = () => {
    const clearedValues: Record<string, any> = {
      status: '',
      amount: [0, 10000],
      currency: 'USD',
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
