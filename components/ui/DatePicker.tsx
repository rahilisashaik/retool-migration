'use client'

import React from 'react'

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          className={`w-full px-4 py-3 bg-input border ${error ? 'border-red-500' : 'border-brand-green/20'} rounded-lg text-white focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-brand-green'} focus:border-transparent transition-all ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
