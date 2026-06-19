import { ClientService } from './client.service'
import { prisma } from '../lib/prisma'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'
import { NotFoundError } from '../errors/AppError'

describe('ClientService', () => {
  describe('create', () => {
    it('creates client scoped to firm', async () => {
      const firm = await createTestFirm()
      const client = await ClientService.create(firm.id, {
        name: 'Alice',
        email: 'a@t.com',
        taxYear: '2024-25',
      })
      expect(client.firmId).toBe(firm.id)
    })
    it('sets status to not_started', async () => {
      const firm = await createTestFirm()
      const client = await ClientService.create(firm.id, {
        name: 'A',
        email: 'a@t.com',
        taxYear: '2024-25',
      })
      expect(client.status).toBe('not_started')
    })
    it('auto-generates unique portalTokens', async () => {
      const firm = await createTestFirm()
      const c1 = await ClientService.create(firm.id, {
        name: 'A',
        email: 'a@t.com',
        taxYear: '2024-25',
      })
      const c2 = await ClientService.create(firm.id, {
        name: 'B',
        email: 'b@t.com',
        taxYear: '2024-25',
      })
      expect(c1.portalToken).not.toBe(c2.portalToken)
    })
  })

  describe('findAll', () => {
    it('returns only non-archived clients for the firm', async () => {
      const firm = await createTestFirm()
      await createTestClient(firm.id, { name: 'Active' })
      await createTestClient(firm.id, { archived: true })
      const result = await ClientService.findAll(firm.id)
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Active')
    })
    it('excludes clients from other firms', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      await createTestClient(firmA.id)
      await createTestClient(firmB.id)
      expect(await ClientService.findAll(firmA.id)).toHaveLength(1)
    })
    it('returns empty array when no clients', async () => {
      const firm = await createTestFirm()
      expect(await ClientService.findAll(firm.id)).toEqual([])
    })
  })

  describe('findById', () => {
    it('returns client with checklist items', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await createTestChecklistItem(client.id, { label: 'P60' })
      const found = await ClientService.findById(firm.id, client.id)
      expect(found.items).toHaveLength(1)
      expect(found.items[0].label).toBe('P60')
    })
    it('throws NotFoundError for wrong firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const client = await createTestClient(firmA.id)
      await expect(ClientService.findById(firmB.id, client.id)).rejects.toThrow(NotFoundError)
    })
    it('throws NotFoundError for unknown id', async () => {
      const firm = await createTestFirm()
      await expect(ClientService.findById(firm.id, 'does-not-exist')).rejects.toThrow(NotFoundError)
    })
  })

  describe('update', () => {
    it('updates allowed fields', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id, { name: 'Old' })
      const updated = await ClientService.update(firm.id, client.id, { name: 'New' })
      expect(updated.name).toBe('New')
    })
    it('throws NotFoundError for wrong firm', async () => {
      const firmA = await createTestFirm()
      const firmB = await createTestFirm()
      const client = await createTestClient(firmA.id)
      await expect(ClientService.update(firmB.id, client.id, { name: 'X' })).rejects.toThrow(
        NotFoundError,
      )
    })
  })

  describe('archive', () => {
    it('sets archived=true without hard deleting', async () => {
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await ClientService.archive(firm.id, client.id)
      const still = await prisma.client.findUnique({ where: { id: client.id } })
      expect(still).not.toBeNull()
      expect(still!.archived).toBe(true)
    })
  })
})
