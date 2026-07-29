import { ReactNode } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { PageHeader, StateContainer, TableContainer } from '@/components/shared'
import { LucideIcon } from 'lucide-react'

interface ListPageLayoutProps {
  title: string
  description: string
  icon?: LucideIcon
  iconColor?: string
  action?: ReactNode
  metadata?: ReactNode
  filters: ReactNode
  isLoading: boolean
  error: string | Error | null
  isEmpty: boolean
  loadingMessage?: string
  errorMessage?: string
  emptyMessage?: string
  emptyDescription?: string
  hasActiveFilters: boolean
  columns: Array<{ key: string; header: string; className?: string }>
  children: ReactNode
}

export function ListPageLayout({
  title,
  description,
  icon: Icon,
  iconColor = 'text-purple-400',
  action,
  metadata,
  filters,
  isLoading,
  error,
  isEmpty,
  loadingMessage = 'Loading...',
  errorMessage = 'Error loading data. Please try again.',
  emptyMessage = 'No data found',
  emptyDescription = 'There is no data to display.',
  hasActiveFilters,
  columns,
  children,
}: ListPageLayoutProps) {
  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <PageHeader
          title={title}
          description={description}
          icon={Icon}
          iconColor={iconColor}
          action={action}
          metadata={metadata}
        />

        {filters}

        <StateContainer
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          loadingMessage={loadingMessage}
          errorMessage={errorMessage}
          emptyMessage={emptyMessage}
          emptyDescription={emptyDescription}
          hasActiveFilters={hasActiveFilters}
        >
          <TableContainer columns={columns}>
            {children}
          </TableContainer>
        </StateContainer>
      </div>
    </div>
  )
}
