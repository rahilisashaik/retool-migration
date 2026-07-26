import React from 'react'

export const BreadIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        className="fill-brand-green"
      />
      <circle cx="9" cy="10" r="1.5" className="fill-brand-dark" />
      <circle cx="15" cy="10" r="1.5" className="fill-brand-dark" />
      <circle cx="12" cy="14" r="1.5" className="fill-brand-dark" />
    </svg>
  )
}
