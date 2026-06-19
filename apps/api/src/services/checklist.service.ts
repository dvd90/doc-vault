import { prisma } from '../lib/prisma'
import { NotFoundError } from '../errors/AppError'
import type { CreateTemplateInput } from '../schemas/template.schema'

export const ChecklistService = {
  async createTemplate(firmId: string, data: CreateTemplateInput) {
    return prisma.checklistTemplate.create({
      data: {
        firmId,
        name: data.name,
        items: { create: data.items },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
  },

  async findAllTemplates(firmId: string) {
    return prisma.checklistTemplate.findMany({
      where: { firmId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
  },

  async updateTemplate(firmId: string, id: string, data: { name?: string }) {
    const existing = await prisma.checklistTemplate.findFirst({ where: { id, firmId } })
    if (!existing) throw new NotFoundError('Template')
    return prisma.checklistTemplate.update({ where: { id }, data })
  },

  async deleteTemplate(firmId: string, id: string) {
    const existing = await prisma.checklistTemplate.findFirst({ where: { id, firmId } })
    if (!existing) throw new NotFoundError('Template')
    return prisma.checklistTemplate.delete({ where: { id } })
  },

  async applyTemplateToClient(firmId: string, clientId: string, templateId: string) {
    const template = await prisma.checklistTemplate.findFirst({
      where: { id: templateId, firmId },
      include: { items: true },
    })
    if (!template) throw new NotFoundError('Template')

    await prisma.checklistItem.createMany({
      data: template.items.map((item) => ({
        clientId,
        label: item.label,
        description: item.description,
        required: item.required,
        sortOrder: item.sortOrder,
      })),
    })

    return prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
  },

  async getClientProgress(clientId: string) {
    const items = await prisma.checklistItem.findMany({ where: { clientId } })
    const required = items.filter((i) => i.required)
    const completed = required.filter((i) => i.completedAt !== null)
    const percentage =
      required.length === 0 ? 100 : Math.round((completed.length / required.length) * 100)
    return { total: items.length, completed: completed.length, percentage }
  },
}
