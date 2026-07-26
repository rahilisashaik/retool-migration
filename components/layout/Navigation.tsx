'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { LayoutDashboard, Search, DollarSign, Flag, FileText, LogOut } from 'lucide-react'
import { BreadIcon } from '@/components/icons/BreadIcon'

export const Navigation = () => {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
    { name: 'KYC Queue', href: '/kyc', Icon: Search },
    { name: 'Refunds', href: '/refunds', Icon: DollarSign },
    { name: 'Feature Flags', href: '/feature-flags', Icon: Flag },
    { name: 'Audit Log', href: '/audit-log', Icon: FileText },
  ]

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <BrandLogo 
              variant="full" 
              size="md" 
              href="/dashboard"
              Icon={BreadIcon}
            />
          </div>

          {/* Navigation links */}
          <div className="nav-items">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    isActive
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'text-gray-400 hover:text-white hover:bg-brand-green/5'
                  }`}
                >
                  <item.Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {session && (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{session.user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.user.role.replace('_', ' ')}</p>
                  </div>
                  <div className="h-8 w-8 bg-brand-green rounded-full flex items-center justify-center text-white font-bold">
                    {session.user.name.charAt(0)}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
