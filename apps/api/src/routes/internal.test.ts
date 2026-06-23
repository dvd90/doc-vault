import { vi } from 'vitest'
vi.mock('../services/reminder.service', () => ({
  ReminderService: { sendPendingReminders: vi.fn().mockResolvedValue(3) },
}))
import { api } from '../test/helpers'
import {
  createTestFirm,
  createTestUser,
  createTestClient,
  createTestChecklistItem,
  createTestUpload,
} from '../test/factories'

const adminHeader = () => ({ 'x-admin-secret': process.env.ADMIN_SECRET ?? 'test-admin-secret' })

describe('POST /internal/reminders/send', () => {
  it('returns 401 without cron secret header', async () => {
    expect((await api.post('/internal/reminders/send')).status).toBe(401)
  })
  it('returns 401 with wrong secret', async () => {
    expect((await api.post('/internal/reminders/send').set('x-cron-secret', 'wrong')).status).toBe(
      401,
    )
  })
  it('returns 200 with count when secret is correct', async () => {
    process.env.CRON_SECRET = 'test-cron-secret'
    const res = await api.post('/internal/reminders/send').set('x-cron-secret', 'test-cron-secret')
    expect(res.status).toBe(200)
    expect(res.body.sent).toBe(3)
  })
})

describe('GET /internal/admin/stats', () => {
  it('returns 401 without admin secret', async () => {
    expect((await api.get('/internal/admin/stats')).status).toBe(401)
  })
  it('returns 401 with wrong admin secret', async () => {
    expect((await api.get('/internal/admin/stats').set('x-admin-secret', 'wrong')).status).toBe(401)
  })
  it('returns platform-wide stats', async () => {
    const firmA = await createTestFirm({ subscriptionStatus: 'active' })
    await createTestFirm({ subscriptionStatus: 'trial' })
    await createTestUser(firmA.id)
    const clientA = await createTestClient(firmA.id)
    const item = await createTestChecklistItem(clientA.id)
    await createTestUpload(item.id)
    const res = await api.get('/internal/admin/stats').set(adminHeader())
    expect(res.status).toBe(200)
    expect(res.body.totalFirms).toBe(2)
    expect(res.body.totalClients).toBe(1)
    expect(res.body.totalUploads).toBe(1)
    expect(res.body.bySubscription.active).toBe(1)
    expect(res.body.bySubscription.trial).toBe(1)
  })
})

describe('GET /internal/admin/firms', () => {
  it('returns 401 without admin secret', async () => {
    expect((await api.get('/internal/admin/firms')).status).toBe(401)
  })
  it('returns all firms with user and client counts', async () => {
    const firm = await createTestFirm({ name: 'ACME CPA', subscriptionStatus: 'active' })
    await createTestUser(firm.id)
    await createTestUser(firm.id)
    await createTestClient(firm.id)
    const res = await api.get('/internal/admin/firms').set(adminHeader())
    expect(res.status).toBe(200)
    const found = res.body.find((f: { id: string }) => f.id === firm.id)
    expect(found).toBeDefined()
    expect(found.name).toBe('ACME CPA')
    expect(found._count.users).toBe(2)
    expect(found._count.clients).toBe(1)
  })
})

describe('GET /internal/admin/firms/:id', () => {
  it('returns 401 without admin secret', async () => {
    expect((await api.get('/internal/admin/firms/some-id')).status).toBe(401)
  })
  it('returns 404 for unknown firm', async () => {
    expect((await api.get('/internal/admin/firms/does-not-exist').set(adminHeader())).status).toBe(
      404,
    )
  })
  it('returns firm with clients and uploads', async () => {
    const firm = await createTestFirm({ name: 'Detail CPA' })
    const client = await createTestClient(firm.id, { name: 'Alice' })
    const item = await createTestChecklistItem(client.id)
    await createTestUpload(item.id, { filename: 'p60.pdf' })
    const res = await api.get(`/internal/admin/firms/${firm.id}`).set(adminHeader())
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Detail CPA')
    expect(res.body.clients[0].name).toBe('Alice')
    expect(res.body.clients[0].items[0].uploads[0].filename).toBe('p60.pdf')
  })
})

describe('POST /internal/digest/send', () => {
  it('returns 401 without cron secret', async () => {
    expect((await api.post('/internal/digest/send')).status).toBe(401)
  })
  it('returns 200 with sent count', async () => {
    const firm = await createTestFirm()
    await createTestUser(firm.id)
    process.env.CRON_SECRET = 'test-cron-secret'
    const res = await api.post('/internal/digest/send').set('x-cron-secret', 'test-cron-secret')
    expect(res.status).toBe(200)
    expect(typeof res.body.sent).toBe('number')
  })
})

describe('POST /internal/auto-archive', () => {
  it('returns 401 without cron secret', async () => {
    expect((await api.post('/internal/auto-archive')).status).toBe(401)
  })
  it('returns 200 with archived count', async () => {
    process.env.CRON_SECRET = 'test-cron-secret'
    const res = await api.post('/internal/auto-archive').set('x-cron-secret', 'test-cron-secret')
    expect(res.status).toBe(200)
    expect(typeof res.body.archived).toBe('number')
  })
})
