import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedDatabaseIfEmpty() {
  try {
    // Check if database already has users
    const userCount = await prisma.user.count()
    
    if (userCount > 0) {
      console.log('Database already has users, but reseeding anyway')
      // Continue to seed/update users
    }

    console.log('Starting seed with production users...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bread.ai' },
      update: { password: adminPassword },
      create: {
        email: 'admin@bread.ai',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    })
    console.log('Created admin user:', admin.email)

    // Create KYC analyst user
    const kycPassword = await bcrypt.hash('kyc123', 10)
    const kycUser = await prisma.user.upsert({
      where: { email: 'kyc@bread.ai' },
      update: { password: kycPassword },
      create: {
        email: 'kyc@bread.ai',
        name: 'KYC Analyst',
        password: kycPassword,
        role: 'KYC_ANALYST',
      },
    })
    console.log('Created KYC user:', kycUser.email)

    // Create support agent user
    const supportPassword = await bcrypt.hash('support123', 10)
    const supportUser = await prisma.user.upsert({
      where: { email: 'support@bread.ai' },
      update: { password: supportPassword },
      create: {
        email: 'support@bread.ai',
        name: 'Support Agent',
        password: supportPassword,
        role: 'SUPPORT_AGENT',
      },
    })
    console.log('Created support user:', supportUser.email)

    // Create product engineer user
    const productPassword = await bcrypt.hash('product123', 10)
    const productUser = await prisma.user.upsert({
      where: { email: 'product@bread.ai' },
      update: { password: productPassword },
      create: {
        email: 'product@bread.ai',
        name: 'Product Engineer',
        password: productPassword,
        role: 'PRODUCT_ENGINEER',
      },
    })
    console.log('Created product user:', productUser.email)

    // Create viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10)
    const viewer = await prisma.user.upsert({
      where: { email: 'viewer@bread.ai' },
      update: { password: viewerPassword },
      create: {
        email: 'viewer@bread.ai',
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
        reviewerId: kycUser.id,
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
        ownerId: productUser.id,
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
        ownerId: productUser.id,
      },
    })
    console.log('Created feature flag:', flag2.key)

  const kycCase3 = await prisma.kycCase.create({
    data: {
      customerId: 'CUST-003',
      status: 'ESCALATED',
      riskScore: 85,
      submittedAt: new Date('2024-01-20'),
      reviewedAt: new Date('2024-01-22'),
      reviewerId: kycUser.id,
    },
  })
  console.log('Created KYC case:', kycCase3.id)

  const refund3 = await prisma.refundRequest.create({
    data: {
      orderId: 'ORD-003',
      customerId: 'CUST-003',
      amount: 299.99,
      currency: 'USD',
      reason: 'Wrong item shipped',
      status: 'ON_HOLD',
      kycCaseId: kycCase3.id,
    },
  })
  console.log('Created refund request:', refund3.id)

  const flag3 = await prisma.featureFlag.create({
    data: {
      key: 'beta_testers_segment',
      name: 'Beta Testers Segment',
      description: 'Enable features for beta tester segment',
      environment: 'PRODUCTION',
      type: 'SEGMENT',
      state: 'ENABLED',
      targetSegment: 'beta_testers',
      ownerId: productUser.id,
    },
  })
  console.log('Created feature flag:', flag3.key)

  const note1 = await prisma.kycNote.create({
    data: {
      caseId: kycCase1.id,
      authorId: kycUser.id,
      body: 'Customer provided additional documentation. Review pending.',
    },
  })
  console.log('Created KYC note:', note1.id)

  const note2 = await prisma.refundNote.create({
    data: {
      refundId: refund2.id,
      authorId: supportUser.id,
      body: 'Customer contacted support - verified purchase details.',
    },
  })
  console.log('Created refund note:', note2.id)

  const audit1 = await prisma.auditEvent.create({
    data: {
      actorId: admin.id,
      action: 'CREATE',
      resourceType: 'FeatureFlag',
      resourceId: flag1.id,
      metadata: JSON.stringify({ key: flag1.key, environment: flag1.environment }),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  })
  console.log('Created audit event:', audit1.id)

  const audit2 = await prisma.auditEvent.create({
    data: {
      actorId: kycUser.id,
      action: 'UPDATE',
      resourceType: 'KycCase',
      resourceId: kycCase2.id,
      metadata: JSON.stringify({ status: 'APPROVED', previousStatus: 'PENDING' }),
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  })
  console.log('Created audit event:', audit2.id)

  console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}