import { vi } from 'vitest'
vi.mock('../services/upload.service', () => ({
  UploadService: { uploadFile: vi.fn().mockResolvedValue({ storagePath: 's3://bucket/logo.png' }) },
}))

import { makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'

describe('PATCH /firms/me', () => {
  it('updates firm name', async () => {
    const firm = await createTestFirm({ name: 'Old' })
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).patch('/firms/me').send({ name: 'New' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New')
  })
  it('rejects invalid hex colour', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).patch('/firms/me').send({ accentColor: 'notahex' })).status).toBe(400)
  })
  it('accepts valid hex colour', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).patch('/firms/me').send({ accentColor: '#FF5733' })
    expect(res.status).toBe(200)
    expect(res.body.accentColor).toBe('#FF5733')
  })
})

describe('POST /firms/me/logo', () => {
  it('returns 400 for non-image file', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/firms/me/logo')
      .attach('logo', Buffer.from('data'), { filename: 'doc.pdf', contentType: 'application/pdf' })
    expect(res.status).toBe(400)
  })
  it('uploads image and updates logoUrl', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/firms/me/logo')
      .attach('logo', Buffer.from('PNG'), { filename: 'logo.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(res.body.logoUrl).toBeDefined()
  })
})
