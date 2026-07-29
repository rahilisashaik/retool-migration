import { Navigation } from '@/components/layout/Navigation'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="page-container">
      <Navigation />
      <div className="page-content">
        <div className="text-center py-12 text-gray-400">
          {message}
        </div>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = 'Error loading data. Please try again.' }: ErrorStateProps) {
  return (
    <div className="page-container">
      <Navigation />
      <div className="page-content">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300">
          {message}
        </div>
      </div>
    </div>
  )
}
