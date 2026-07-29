import { ReactNode } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { BackButton } from '@/components/shared'
import { LucideIcon } from 'lucide-react'

interface DetailPageLayoutProps {
  backHref: string
  backLabel?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function DetailPageLayout({
  backHref,
  backLabel = 'Back',
  title,
  subtitle,
  actions,
  children,
}: DetailPageLayoutProps) {
  return (
    <div className="page-container">
      <Navigation />
      
      <div className="page-content">
        <div className="mb-6">
          <BackButton href={backHref} label={backLabel} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
