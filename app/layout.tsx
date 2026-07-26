import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Internal Engineering Platform',
  description: 'Unified platform for KYC, Refunds, and Feature Flags',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
