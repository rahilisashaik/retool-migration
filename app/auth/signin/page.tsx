'use client'

import { useState } from 'react'
import { AnimatedBreadBackground } from '@/components/ui/AnimatedBreadBackground'
import { BrandSection } from '@/components/ui/BrandSection'
import { SignInForm } from '@/components/auth/SignInForm'
import { PoweredByFooter } from '@/components/ui/PoweredByFooter'

export default function SignInPage() {
  const [error, setError] = useState('')

  return (
    <div className="full-center">
      <div className="auth-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Interactive bread animation */}
          <div className="hidden lg:block relative">
            <AnimatedBreadBackground />
            <BrandSection />
          </div>

          {/* Right side - Sign in form */}
          <div className="flex flex-col justify-center">
            <div className="auth-form-container">
              <div className="auth-header">
                <h2 className="auth-title">
                  Welcome back
                </h2>
                <p className="auth-subtitle">
                  Sign in to access the Bread AI platform
                </p>
              </div>

              <SignInForm 
                onError={setError}
                showDemoCredentials={true}
              />

              <PoweredByFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
