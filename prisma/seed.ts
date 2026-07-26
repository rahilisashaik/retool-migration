import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.auditEvent.deleteMany()
  await prisma.featureFlagChange.deleteMany()
  await prisma.refundNote.deleteMany()
  await prisma.kycNote.deleteMany()
  await prisma.refundRequest.deleteMany()
  await prisma.kycCase.deleteMany()
  await prisma.featureFlag.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'ADMIN',
        team: 'Engineering',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kyc.analyst@company.com',
        name: 'KYC Analyst',
        role: 'KYC_ANALYST',
        team: 'Compliance',
      },
    }),
    prisma.user.create({
      data: {
        email: 'support.agent@company.com',
        name: 'Support Agent',
        role: 'SUPPORT_AGENT',
        team: 'Customer Success',
      },
    }),
    prisma.user.create({
      data: {
        email: 'product.engineer@company.com',
        name: 'Product Engineer',
        role: 'PRODUCT_ENGINEER',
        team: 'Product',
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer@company.com',
        name: 'Viewer User',
        role: 'VIEWER',
        team: 'Operations',
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create KYC cases
  const kycCases = await Promise.all([
    prisma.kycCase.create({
      data: {
        customerId: 'CUST001',
        status: 'PENDING',
        riskScore: 45,
        submittedAt: new Date('2024-01-15'),
        documents: JSON.stringify({
          idDocument: { type: 'passport', status: 'verified' },
          proofOfAddress: { type: 'utility_bill', status: 'pending' },
        }),
      },
    }),
    prisma.kycCase.create({
      data: {
        customerId: 'CUST002',
        status: 'ESCALATED',
        riskScore: 85,
        submittedAt: new Date('2024-01-10'),
        reviewedAt: new Date('2024-01-12'),
        reviewerId: users[1].id, // KYC Analyst
        documents: JSON.stringify({
          idDocument: { type: 'drivers_license', status: 'flagged' },
          proofOfAddress: { type: 'bank_statement', status: 'verified' },
        }),
      },
    }),
    prisma.kycCase.create({
      data: {
        customerId: 'CUST003',
        status: 'APPROVED',
        riskScore: 20,
        submittedAt: new Date('2024-01-05'),
        reviewedAt: new Date('2024-01-06'),
        reviewerId: users[1].id,
        documents: JSON.stringify({
          idDocument: { type: 'passport', status: 'verified' },
          proofOfAddress: { type: 'utility_bill', status: 'verified' },
        }),
      },
    }),
    prisma.kycCase.create({
      data: {
        customerId: 'CUST004',
        status: 'REJECTED',
        riskScore: 95,
        submittedAt: new Date('2024-01-08'),
        reviewedAt: new Date('2024-01-09'),
        reviewerId: users[1].id,
        documents: JSON.stringify({
          idDocument: { type: 'passport', status: 'rejected' },
          proofOfAddress: { type: 'utility_bill', status: 'flagged' },
        }),
      },
    }),
  ])

  console.log(`✅ Created ${kycCases.length} KYC cases`)

  // Add KYC notes
  await prisma.kycNote.create({
    data: {
      caseId: kycCases[1].id,
      authorId: users[1].id,
      body: 'Customer submitted documents that appear to be manipulated. Flagging for manual review.',
    },
  })

  // Create refund requests
  const refundRequests = await Promise.all([
    prisma.refundRequest.create({
      data: {
        orderId: 'ORD001',
        customerId: 'CUST001',
        amount: 150,
        currency: 'USD',
        reason: 'Product not as described',
        status: 'PENDING',
      },
    }),
    prisma.refundRequest.create({
      data: {
        orderId: 'ORD002',
        customerId: 'CUST002',
        amount: 500,
        currency: 'USD',
        reason: 'Duplicate charge',
        status: 'ON_HOLD',
        kycCaseId: kycCases[1].id, // Linked to escalated KYC case
      },
    }),
    prisma.refundRequest.create({
      data: {
        orderId: 'ORD003',
        customerId: 'CUST003',
        amount: 75,
        currency: 'USD',
        reason: 'Service cancellation',
        status: 'APPROVED',
      },
    }),
    prisma.refundRequest.create({
      data: {
        orderId: 'ORD004',
        customerId: 'CUST005',
        amount: 250,
        currency: 'USD',
        reason: 'Defective product',
        status: 'DENIED',
      },
    }),
  ])

  console.log(`✅ Created ${refundRequests.length} refund requests`)

  // Add refund notes
  await prisma.refundNote.create({
    data: {
      refundId: refundRequests[1].id,
      authorId: users[2].id,
      body: 'Placed on hold pending KYC investigation for high-risk customer.',
    },
  })

  // Create feature flags
  const featureFlags = await Promise.all([
    prisma.featureFlag.create({
      data: {
        key: 'new_onboarding_flow',
        name: 'New Onboarding Flow',
        description: 'Enabled the new customer onboarding experience',
        environment: 'PRODUCTION',
        type: 'BOOLEAN',
        state: 'ENABLED',
        ownerId: users[3].id,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'experimental_dashboard',
        name: 'Experimental Dashboard',
        description: 'Show experimental dashboard features to users',
        environment: 'STAGING',
        type: 'PERCENTAGE',
        state: 'ENABLED',
        rolloutPercentage: 25,
        ownerId: users[3].id,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'high_risk_segment_gating',
        name: 'High-Risk Segment Gating',
        description: 'Gate certain features for high-risk customer segments',
        environment: 'PRODUCTION',
        type: 'SEGMENT',
        state: 'DISABLED',
        targetSegment: 'high_risk_customers',
        ownerId: users[3].id,
      },
    }),
    prisma.featureFlag.create({
      data: {
        key: 'instant_refunds',
        name: 'Instant Refunds',
        description: 'Enable instant refund processing',
        environment: 'PRODUCTION',
        type: 'BOOLEAN',
        state: 'DISABLED',
        ownerId: users[3].id,
      },
    }),
  ])

  console.log(`✅ Created ${featureFlags.length} feature flags`)

  // Create feature flag changes
  await prisma.featureFlagChange.create({
    data: {
      flagId: featureFlags[0].id,
      actorId: users[3].id,
      field: 'state',
      oldValue: 'DISABLED',
      newValue: 'ENABLED',
      reason: 'Ready for production rollout',
    },
  })

  // Create sample audit events
  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: users[1].id,
        action: 'KYC_CASE_ESCALATED',
        resourceType: 'KycCase',
        resourceId: kycCases[1].id,
        metadata: JSON.stringify({ reason: 'High risk score detected' }),
      },
      {
        actorId: users[2].id,
        action: 'REFUND_PLACED_ON_HOLD',
        resourceType: 'RefundRequest',
        resourceId: refundRequests[1].id,
        metadata: JSON.stringify({ reason: 'Pending KYC review' }),
      },
      {
        actorId: users[3].id,
        action: 'FEATURE_FLAG_ENABLED',
        resourceType: 'FeatureFlag',
        resourceId: featureFlags[0].id,
        metadata: JSON.stringify({ reason: 'Production release' }),
      },
    ],
  })

  console.log(`✅ Created audit events`)

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: users[1].id,
        type: 'KYC_ASSIGNMENT',
        message: 'New KYC case CUST002 requires review',
      },
      {
        userId: users[2].id,
        type: 'REFUND_UPDATE',
        message: 'Refund ORD002 status changed to ON_HOLD',
      },
    ],
  })

  console.log(`✅ Created notifications`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
