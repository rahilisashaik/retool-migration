import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedDatabaseIfEmpty() {
  try {
    // Check if database already has users
    const userCount = await prisma.user.count()
    
    if (userCount > 0) {
      console.log('Database already has users, skipping seed')
      return
    }

    console.log('Database is empty, starting seed...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@retool.com' },
      update: {},
      create: {
        email: 'admin@retool.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    })
    console.log('Created admin user:', admin.email)

    // Create viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10)
    const viewer = await prisma.user.upsert({
      where: { email: 'viewer@retool.com' },
      update: {},
      create: {
        email: 'viewer@retool.com',
        name: 'Viewer User',
        password: viewerPassword,
        role: 'VIEWER',
      },
    })
    console.log('Created viewer user:', viewer.email)

    // Create some sample KYC cases
    const kycCase1 = await prisma.kycCase.create({
      data: {
        customerId: 'CUST-001',
        status: 'PENDING',
        riskScore: 35,
        submittedAt: new Date('2024-01-15'),
      },
    })
    console.log('Created KYC case:', kycCase1.id)

    const kycCase2 = await prisma.kycCase.create({
      data: {
        customerId: 'CUST-002',
        status: 'APPROVED',
        riskScore: 15,
        submittedAt: new Date('2024-01-10'),
        reviewedAt: new Date('2024-01-12'),
        reviewerId: admin.id,
      },
    })
    console.log('Created KYC case:', kycCase2.id)

    // Create some sample refund requests
    const refund1 = await prisma.refundRequest.create({
      data: {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        amount: 99.99,
        currency: 'USD',
        reason: 'Product not as described',
        status: 'PENDING',
      },
    })
    console.log('Created refund request:', refund1.id)

    const refund2 = await prisma.refundRequest.create({
      data: {
        orderId: 'ORD-002',
        customerId: 'CUST-002',
        amount: 149.50,
        currency: 'USD',
        reason: 'Defective item',
        status: 'APPROVED',
      },
    })
    console.log('Created refund request:', refund2.id)

    // Create some sample feature flags
    const flag1 = await prisma.featureFlag.create({
      data: {
        key: 'new_dashboard_ui',
        name: 'New Dashboard UI',
        description: 'Enable the new dashboard interface',
        environment: 'STAGING',
        type: 'BOOLEAN',
        state: 'ENABLED',
        ownerId: admin.id,
      },
    })
    console.log('Created feature flag:', flag1.key)

    const flag2 = await prisma.featureFlag.create({
      data: {
        key: 'percentage_rollout',
        name: 'Percentage Rollout Test',
        description: 'Test percentage-based rollout',
        environment: 'PRODUCTION',
        type: 'PERCENTAGE',
        state: 'ENABLED',
        rolloutPercentage: 25,
        ownerId: admin.id,
      },
    })
    console.log('Created feature flag:', flag2.key)

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}