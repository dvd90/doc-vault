import { ChecklistService } from './checklist.service'
import { prisma } from '../lib/prisma'
import { createTestFirm, createTestClient, createTestTemplate, createTestChecklistItem } from '../test/factories'
import { NotFoundError } from '../errors/AppError'

describe('ChecklistService', () => {
  describe('createTemplate', () => {
    it('creates template with items in correct sort order', async () => {
      const firm = await createTestFirm()
      const tmpl = await ChecklistService.createTemplate(firm.id, {
        name: 'SA Pack',
        items: [{ label: 'P60', required: true, sortOrder: 0 }, { label: 'Bank', required: true, sortOrder: 1 }],
      })
      expect(tmpl.items).toHaveLength(2)
      expect(tmpl.items[0].label).toBe('P60')
      expect(tmpl.items[1].label).toBe('Bank')
    })
    it('scopes template to firm', async () => {
      const firm = await createTestFirm()
      const tmpl = await ChecklistService.createTemplate(firm.id, { name: 'Pack', items: [{ label: 'P60', required: true, sortOrder: 0 }] })
      expect(tmpl.firmId).toBe(firm.id)
    })
  })

  describe('applyTemplateToClient', () => {
    it('copies template items onto client as ChecklistItems', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const tmpl = await createTestTemplate(firm.id)
      await ChecklistService.applyTemplateToClient(firm.id, client.id, tmpl.id)
      const updated = await prisma.client.findUniqueOrThrow({ where: { id: client.id }, include: { items: true } })
      expect(updated.items.length).toBe(tmpl.items.length)
    })
    it('preserves sort order from template', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const tmpl = await createTestTemplate(firm.id)
      await ChecklistService.applyTemplateToClient(firm.id, client.id, tmpl.id)
      const updated = await prisma.client.findUniqueOrThrow({ where: { id: client.id }, include: { items: { orderBy: { sortOrder: 'asc' } } } })
      expect(updated.items[0].sortOrder).toBe(0)
    })
    it('throws NotFoundError when template belongs to another firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const client = await createTestClient(firmA.id)
      const tmpl = await createTestTemplate(firmB.id)
      await expect(ChecklistService.applyTemplateToClient(firmA.id, client.id, tmpl.id)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findAllTemplates', () => {
    it('returns only templates for the given firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      await createTestTemplate(firmA.id)
      await createTestTemplate(firmB.id)
      const results = await ChecklistService.findAllTemplates(firmA.id)
      expect(results).toHaveLength(1)
      expect(results[0].firmId).toBe(firmA.id)
    })
  })

  describe('updateTemplate', () => {
    it('updates template name', async () => {
      const firm = await createTestFirm()
      const tmpl = await createTestTemplate(firm.id)
      const updated = await ChecklistService.updateTemplate(firm.id, tmpl.id, { name: 'Updated Name' })
      expect(updated.name).toBe('Updated Name')
    })
    it('throws NotFoundError when template belongs to another firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const tmpl = await createTestTemplate(firmA.id)
      await expect(ChecklistService.updateTemplate(firmB.id, tmpl.id, { name: 'X' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteTemplate', () => {
    it('deletes the template', async () => {
      const firm = await createTestFirm()
      const tmpl = await createTestTemplate(firm.id)
      await ChecklistService.deleteTemplate(firm.id, tmpl.id)
      expect(await prisma.checklistTemplate.findUnique({ where: { id: tmpl.id } })).toBeNull()
    })
    it('throws NotFoundError when template belongs to another firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const tmpl = await createTestTemplate(firmA.id)
      await expect(ChecklistService.deleteTemplate(firmB.id, tmpl.id)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getClientProgress', () => {
    it('returns total, completed, percentage', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await createTestChecklistItem(client.id, { required: true, completedAt: new Date() })
      await createTestChecklistItem(client.id, { required: true })
      const p = await ChecklistService.getClientProgress(client.id)
      expect(p.total).toBe(2)
      expect(p.completed).toBe(1)
      expect(p.percentage).toBe(50)
    })
    it('optional items do not count toward percentage', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await createTestChecklistItem(client.id, { required: true, completedAt: new Date() })
      await createTestChecklistItem(client.id, { required: false })
      const p = await ChecklistService.getClientProgress(client.id)
      expect(p.percentage).toBe(100)
    })
  })
})
