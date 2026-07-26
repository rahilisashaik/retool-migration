// Role-based permission constants
import { UserRole } from '@prisma/client'

export const ROLES = {
  ADMIN: UserRole.ADMIN,
  KYC_ANALYST: UserRole.KYC_ANALYST,
  SUPPORT_AGENT: UserRole.SUPPORT_AGENT,
  PRODUCT_ENGINEER: UserRole.PRODUCT_ENGINEER,
  VIEWER: UserRole.VIEWER,
} as const

export const PERMISSIONS = {
  // KYC permissions
  KYC_READ: 'kyc:read',
  KYC_WRITE: 'kyc:write',
  KYC_DELETE: 'kyc:delete',
  
  // Refund permissions
  REFUND_READ: 'refund:read',
  REFUND_WRITE: 'refund:write',
  REFUND_DELETE: 'refund:delete',
  
  // Feature flag permissions
  FLAG_READ: 'flag:read',
  FLAG_WRITE: 'flag:write',
  FLAG_DELETE: 'flag:delete',
  
  // Audit log permissions
  AUDIT_READ: 'audit:read',
  
  // Admin permissions
  ADMIN_ALL: 'admin:all',
} as const

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.KYC_ANALYST]: [
    PERMISSIONS.KYC_READ,
    PERMISSIONS.KYC_WRITE,
    PERMISSIONS.REFUND_READ,
    PERMISSIONS.FLAG_READ,
    PERMISSIONS.AUDIT_READ,
  ],
  [ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.REFUND_READ,
    PERMISSIONS.REFUND_WRITE,
    PERMISSIONS.KYC_READ,
    PERMISSIONS.FLAG_READ,
    PERMISSIONS.AUDIT_READ,
  ],
  [ROLES.PRODUCT_ENGINEER]: [
    PERMISSIONS.FLAG_READ,
    PERMISSIONS.FLAG_WRITE,
    PERMISSIONS.KYC_READ,
    PERMISSIONS.REFUND_READ,
    PERMISSIONS.AUDIT_READ,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.KYC_READ,
    PERMISSIONS.REFUND_READ,
    PERMISSIONS.FLAG_READ,
    PERMISSIONS.AUDIT_READ,
  ],
}

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission) || userRole === ROLES.ADMIN
}

export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function requirePermission(userRole: string, permission: string): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Permission denied: ${permission} required`)
  }
}
