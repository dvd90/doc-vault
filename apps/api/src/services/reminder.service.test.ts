import { vi } from 'vitest'
vi.mock('./notification.service', () => ({
  NotificationService: { sendReminderToClient: vi.fn().mockResolvedValue(undefined) },
}))

import { ReminderService } from './reminder.service'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

describe('ReminderService', () => {
  describe('getOverdueClients', () => {
    it('returns incomplete clients created more than 7 days ago', async () => {
      const firm = await createTestFirm()
      const old = await createTestClient(firm.id, { createdAt: daysAgo(8), status: 'in_progress' })
      await createTestChecklistItem(old.id)
      const recent = await createTestClient(firm.id, { status: 'in_progress' })
      await createTestChecklistItem(recent.id)
      const overdue = await ReminderService.getOverdueClients()
      expect(overdue.map((c) => c.id)).toContain(old.id)
      expect(overdue.map((c) => c.id)).not.toContain(recent.id)
    })
    it('excludes archived clients', async () => {
      const firm = await createTestFirm()
      const archived = await createTestClient(firm.id, { createdAt: daysAgo(8), archived: true })
      await createTestChecklistItem(archived.id)
      expect((await ReminderService.getOverdueClients()).map((c) => c.id)).not.toContain(
        archived.id,
      )
    })
    it('excludes complete clients', async () => {
      const firm = await createTestFirm()
      const done = await createTestClient(firm.id, { createdAt: daysAgo(8), status: 'complete' })
      await createTestChecklistItem(done.id)
      expect((await ReminderService.getOverdueClients()).map((c) => c.id)).not.toContain(done.id)
    })
  })

  describe('sendPendingReminders', () => {
    it('returns count of reminders sent', async () => {
      const firm = await createTestFirm()
      for (let i = 0; i < 2; i++) {
        const c = await createTestClient(firm.id, { createdAt: daysAgo(8 + i) })
        await createTestChecklistItem(c.id)
      }
      expect(await ReminderService.sendPendingReminders()).toBe(2)
    })
  })
})
