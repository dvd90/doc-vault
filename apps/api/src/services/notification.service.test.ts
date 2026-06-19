import { vi } from 'vitest'

vi.mock('../lib/resend', () => ({
  resend: { emails: { send: vi.fn().mockResolvedValue({ id: 'email-123' }) } },
}))

import { NotificationService } from './notification.service'
import { createTestFirm, createTestClient, createTestChecklistItem, createTestUser } from '../test/factories'

describe('NotificationService', () => {
  describe('sendPortalInvite', () => {
    it('sends email to client address', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm({ name: 'ACME CPA' })
      const client = await createTestClient(firm.id, { email: 'bob@client.com' })
      await NotificationService.sendPortalInvite(client.id)
      expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'bob@client.com' }))
    })
    it('email body contains the portalToken', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      await NotificationService.sendPortalInvite(client.id)
      const call = (resend.emails.send as ReturnType<typeof vi.fn>).mock.calls.at(-1)[0]
      expect(call.html).toContain(client.portalToken)
    })
    it('subject contains firm name', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm({ name: 'Smith CPA' })
      const client = await createTestClient(firm.id)
      await NotificationService.sendPortalInvite(client.id)
      const call = (resend.emails.send as ReturnType<typeof vi.fn>).mock.calls.at(-1)[0]
      expect(call.subject).toContain('Smith CPA')
    })
  })

  describe('sendUploadReceived', () => {
    it('sends notification to accountant mentioning client and item label', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm()
      await createTestUser(firm.id, { email: 'accountant@firm.com' })
      const client = await createTestClient(firm.id, { name: 'Alice' })
      const item = await createTestChecklistItem(client.id, { label: 'P60' })
      await NotificationService.sendUploadReceived(item.id)
      const call = (resend.emails.send as ReturnType<typeof vi.fn>).mock.calls.at(-1)[0]
      expect(call.subject).toContain('Alice')
    })
  })

  describe('sendChecklistComplete', () => {
    it('sends completion notification to accountant', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm()
      await createTestUser(firm.id, { email: 'accountant@firm.com' })
      const client = await createTestClient(firm.id, { name: 'Bob' })
      await NotificationService.sendChecklistComplete(client.id)
      const call = (resend.emails.send as ReturnType<typeof vi.fn>).mock.calls.at(-1)[0]
      expect(call.subject).toContain('Bob')
    })
  })

  describe('sendReminderToClient', () => {
    it('sends reminder to client email with portal link', async () => {
      const { resend } = await import('../lib/resend')
      const firm = await createTestFirm({ name: 'Reminder CPA' })
      const client = await createTestClient(firm.id, { email: 'remind@client.com', name: 'Carol' })
      await NotificationService.sendReminderToClient(client.id)
      const call = (resend.emails.send as ReturnType<typeof vi.fn>).mock.calls.at(-1)[0]
      expect(call.to).toBe('remind@client.com')
      expect(call.html).toContain(client.portalToken)
    })
  })
})
