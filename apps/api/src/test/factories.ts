import { prisma } from '../lib/prisma'
import { v4 as uuid } from 'uuid'

export async function createTestFirm(overrides: Record<string, unknown> = {}) {
  return prisma.firm.create({
    data: {
      name: 'Test Accounting Ltd',
      subscriptionStatus: 'active',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ...overrides,
    },
  })
}

export async function createTestUser(firmId: string, overrides: Record<string, unknown> = {}) {
  return prisma.user.create({
    data: {
      googleId: `google-${uuid()}`,
      email: `user-${uuid()}@test.com`,
      name: 'Test User',
      firmId,
      ...overrides,
    },
  })
}

export async function createTestClient(firmId: string, overrides: Record<string, unknown> = {}) {
  return prisma.client.create({
    data: {
      firmId,
      name: 'Alice Smith',
      email: `alice-${uuid()}@example.com`,
      taxYear: '2024-25',
      ...overrides,
    },
  })
}

export async function createTestChecklistItem(clientId: string, overrides: Record<string, unknown> = {}) {
  return prisma.checklistItem.create({
    data: {
      clientId,
      label: 'P60 from employer',
      required: true,
      sortOrder: 0,
      ...overrides,
    },
  })
}

export async function createTestTemplate(firmId: string, overrides: Record<string, unknown> = {}) {
  return prisma.checklistTemplate.create({
    data: {
      firmId,
      name: 'Self Assessment Pack',
      items: {
        create: [
          { label: 'P60 from employer', sortOrder: 0, required: true },
          { label: '3 months bank statements', sortOrder: 1, required: true },
          { label: 'Mortgage interest cert', sortOrder: 2, required: false },
        ],
      },
      ...overrides,
    },
    include: { items: true },
  })
}

export async function createTestUpload(checklistItemId: string, overrides: Record<string, unknown> = {}) {
  return prisma.upload.create({
    data: {
      checklistItemId,
      storagePath: `uploads/firm/client/${uuid()}.pdf`,
      filename: 'p60.pdf',
      fileSize: 102400,
      mimeType: 'application/pdf',
      ...overrides,
    },
  })
}
