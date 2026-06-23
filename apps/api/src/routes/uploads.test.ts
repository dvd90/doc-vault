import { vi } from 'vitest'

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3.example.com/presigned-url'),
}))

import { api, makeAuthedRequest } from '../test/helpers'
import {
  createTestFirm,
  createTestUser,
  createTestClient,
  createTestChecklistItem,
  createTestUpload,
} from '../test/factories'

describe('GET /uploads/:uploadId/view', () => {
  it('returns 401 when unauthenticated', async () => {
    expect((await api.get('/uploads/some-id/view')).status).toBe(401)
  })
  it('returns 404 for upload from another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const userB = await createTestUser(firmB.id)
    const clientA = await createTestClient(firmA.id)
    const itemA = await createTestChecklistItem(clientA.id)
    const upload = await createTestUpload(itemA.id)
    const res = await makeAuthedRequest(userB.id, firmB.id).get(`/uploads/${upload.id}/view`)
    expect(res.status).toBe(404)
  })
  it('returns presigned URL', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const upload = await createTestUpload(item.id)
    const res = await makeAuthedRequest(user.id, firm.id).get(`/uploads/${upload.id}/view`)
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://s3.example.com/presigned-url')
  })
})
