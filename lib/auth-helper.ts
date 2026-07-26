import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasPermission, requirePermission } from './permissions'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requirePermissionCheck(permission: string) {
  const user = await requireAuth()
  requirePermission(user.role, permission)
  return user
}

export async function checkPermission(permission: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    return hasPermission(user.role, permission)
  } catch {
    return false
  }
}
