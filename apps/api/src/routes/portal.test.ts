import { vi } from 'vitest'

vi.mock('../services/notification.service', () => ({
  NotificationService: {
    sendUploadReceived: vi.fn().mockResolvedValue(undefined),
    sendChecklistComplete: vi.fn().mockResolvedValue(undefined),
  },
}))
vi.mock('../services/upload.service', () => ({
  UploadService: {
    uploadFile: vi
      .fn()
      .mockResolvedValue({ id: 'upload-1', filename: 'p60.pdf', storagePath: 's3://test' }),
  },
}))

import { api } from '../test/helpers'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'

describe('GET /portal/:token', () => {
  it('returns 404 for unknown token', async () => {
    expect((await api.get('/portal/unknown-token')).status).toBe(404)
  })
  it('returns client, firm branding, and items without auth', async () => {
    const firm = await createTestFirm({ name: 'CPA Ltd', accentColor: '#ff0000' })
    const client = await createTestClient(firm.id, { name: 'Alice' })
    await createTestChecklistItem(client.id, { label: 'P60' })
    const res = await api.get(`/portal/${client.portalToken}`)
    expect(res.status).toBe(200)
    expect(res.body.client.name).toBe('Alice')
    expect(res.body.firm.accentColor).toBe('#ff0000')
    expect(res.body.items[0].label).toBe('P60')
  })
  it('returns 404 for archived client', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id, { archived: true })
    expect((await api.get(`/portal/${client.portalToken}`)).status).toBe(404)
  })
  it('returns 404 for expired portal link', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id, {
      portalExpiresAt: new Date(Date.now() - 1000),
    })
    expect((await api.get(`/portal/${client.portalToken}`)).status).toBe(404)
  })
  it('returns 200 for non-expired portal link', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id, {
      portalExpiresAt: new Date(Date.now() + 60000),
    })
    expect((await api.get(`/portal/${client.portalToken}`)).status).toBe(200)
  })
})

describe('POST /portal/:token/upload/:itemId', () => {
  it('returns 400 when no file attached', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    expect((await api.post(`/portal/${client.portalToken}/upload/${item.id}`)).status).toBe(400)
  })
  it('returns 400 for disallowed file type', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const res = await api
      .post(`/portal/${client.portalToken}/upload/${item.id}`)
      .attach('file', Buffer.from('data'), {
        filename: 'virus.exe',
        contentType: 'application/exe',
      })
    expect(res.status).toBe(400)
  })
  it('marks item complete and returns updated item on success', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const res = await api
      .post(`/portal/${client.portalToken}/upload/${item.id}`)
      .attach('file', Buffer.from('%PDF-1.4'), {
        filename: 'p60.pdf',
        contentType: 'application/pdf',
      })
    expect(res.status).toBe(200)
    expect(res.body.item.completedAt).toBeDefined()
  })
})
