import { AlertTriangle } from 'lucide-react'
import { ReactNode } from 'react'

interface StateContainerProps {
  isLoading?: boolean
  error?: string | null
  isEmpty?: boolean
  loadingMessage?: string
  errorMessage?: string
  emptyMessage?: string
  emptyDescription?: string
  showEmptyWhenFiltered?: boolean
  hasActiveFilters?: boolean
  children: ReactNode
}

export function StateContainer({
  isLoading = false,
  error = null,
  isEmpty = false,
  loadingMessage = 'Loading...',
  errorMessage = 'Error loading data. Please try again.',
  emptyMessage = 'No data found',
  emptyDescription = 'There is no data to display.',
  showEmptyWhenFiltered = true,
  hasActiveFilters = false,
  children,
}: StateContainerProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        {loadingMessage}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
        {errorMessage}
      </div>
    )
  }

  if (isEmpty) {
    const showEmpty = showEmptyWhenFiltered || !hasActiveFilters
    if (!showEmpty) return <>{children}</>

    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
        <AlertTriangle size={48} className="text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{emptyMessage}</h3>
        <p className="text-gray-400">
          {hasActiveFilters
            ? 'Try adjusting your filters to see more results.'
            : emptyDescription}
        </p>
      </div>
    )
  }

  return <>{children}</>
}
