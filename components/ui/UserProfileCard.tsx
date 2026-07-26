import React from 'react'
import { Card, CardHeader, CardContent } from './Card'
import { Badge } from './Badge'

interface UserProfileCardProps {
  email: string
  role: string
  userId: string
  className?: string
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  email,
  role,
  userId,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Your Profile</h3>
      </CardHeader>
      <CardContent>
        <dl className="user-profile-grid">
          <div>
            <dt className="data-label">Email</dt>
            <dd className="data-value">{email}</dd>
          </div>
          <div>
            <dt className="data-label">Role</dt>
            <dd className="mt-1">
              <Badge variant="default">
                {role.replace('_', ' ')}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="data-label">User ID</dt>
            <dd className="data-value font-mono">{userId.slice(0, 8)}...</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
