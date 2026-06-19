import { prisma } from '../lib/prisma'

beforeEach(async () => {
  await prisma.upload.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.checklistTemplateItem.deleteMany()
  await prisma.checklistTemplate.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
  await prisma.firm.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
