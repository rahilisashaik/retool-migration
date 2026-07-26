'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SignInFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  showDemoCredentials?: boolean
  className?: string
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
  onError,
  showDemoCredentials = true,
  className = ''
}) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage = 'Invalid credentials'
        setError(errorMessage)
        onError?.(errorMessage)
      } else {
        onSuccess?.()
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      const errorMessage = 'An error occurred. Please try again.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`form-container ${className}`}>
      {error && (
        <div className="error-container">
          {error}
        </div>
      )}

      <form className="input-group" onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email address"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ? '' : undefined}
        />

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ? '' : undefined}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {showDemoCredentials && (
        <div className="demo-credentials">
          <p className="demo-title">
            Demo credentials available
          </p>
          <div className="demo-list">
            <p>admin@company.com</p>
            <p>kyc.analyst@company.com</p>
            <p>support.agent@company.com</p>
            <p>product.engineer@company.com</p>
            <p className="demo-password">Password: password123</p>
          </div>
        </div>
      )}
    </div>
  )
}
