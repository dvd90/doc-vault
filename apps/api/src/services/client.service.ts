import { prisma } from '../lib/prisma'
import { NotFoundError } from '../errors/AppError'
import type { CreateClientInput, UpdateClientInput } from '../schemas/client.schema'

export const ClientService = {
  async create(firmId: string, data: CreateClientInput) {
    return prisma.client.create({ data: { ...data, firmId } })
  },

  async findAll(firmId: string) {
    return prisma.client.findMany({ where: { firmId, archived: false } })
  },

  async findById(firmId: string, id: string) {
    const client = await prisma.client.findFirst({
      where: { id, firmId },
      include: { items: { orderBy: { sortOrder: 'asc' }, include: { uploads: true } } },
    })
    if (!client) throw new NotFoundError('Client')
    return client
  },

  async update(firmId: string, id: string, data: UpdateClientInput) {
    const existing = await prisma.client.findFirst({ where: { id, firmId } })
    if (!existing) throw new NotFoundError('Client')
    return prisma.client.update({ where: { id }, data })
  },

  async archive(firmId: string, id: string) {
    const existing = await prisma.client.findFirst({ where: { id, firmId } })
    if (!existing) throw new NotFoundError('Client')
    return prisma.client.update({ where: { id }, data: { archived: true } })
  },

  async autoArchiveCompleted(daysAfterCompletion: number) {
    const threshold = new Date(Date.now() - daysAfterCompletion * 24 * 60 * 60 * 1000)
    const result = await prisma.client.updateMany({
      where: {
        status: 'complete',
        archived: false,
        updatedAt: { lt: threshold },
      },
      data: { archived: true },
    })
    return result.count
  },
}
