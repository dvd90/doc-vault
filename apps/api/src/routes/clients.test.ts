import { vi } from 'vitest'
import { mockClient } from 'aws-sdk-client-mock'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

const s3Mock = mockClient(S3Client)
beforeEach(() => s3Mock.reset())

import { api, makeAuthedRequest } from '../test/helpers'
import {
  createTestFirm,
  createTestUser,
  createTestClient,
  createTestChecklistItem,
  createTestUpload,
} from '../test/factories'

describe('POST /clients', () => {
  it('returns 401 when unauthenticated', async () => {
    expect(
      (await api.post('/clients').send({ name: 'A', email: 'a@b.com', taxYear: '2024-25' })).status,
    ).toBe(401)
  })
  it('returns 400 for invalid body', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (await makeAuthedRequest(user.id, firm.id).post('/clients').send({ name: '' })).status,
    ).toBe(400)
  })
  it('creates client and returns 201', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients')
      .send({ name: 'Alice', email: 'alice@test.com', taxYear: '2024-25' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Alice')
    expect(res.body.portalToken).toBeDefined()
  })
  it('scopes client to authenticated firm', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients')
      .send({ name: 'Alice', email: 'alice@test.com', taxYear: '2024-25' })
    expect(res.body.firmId).toBe(firm.id)
  })
})

describe('GET /clients', () => {
  it('returns only non-archived clients for this firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const user = await createTestUser(firmA.id)
    await createTestClient(firmA.id, { name: 'Active' })
    await createTestClient(firmA.id, { archived: true })
    await createTestClient(firmB.id)
    const res = await makeAuthedRequest(user.id, firmA.id).get('/clients')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Active')
  })
  it('returns empty array when no clients', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).get('/clients')
    expect(res.body).toEqual([])
  })
})

describe('GET /clients/export', () => {
  it('returns 401 when unauthenticated', async () => {
    expect((await api.get('/clients/export')).status).toBe(401)
  })
  it('returns CSV with correct headers', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).get('/clients/export')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/csv')
    expect(res.text).toContain('name,email,taxYear,status,createdAt')
  })
  it('includes all non-archived clients', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    await createTestClient(firm.id, { name: 'Alice Export' })
    await createTestClient(firm.id, { name: 'Bob Archived', archived: true })
    const res = await makeAuthedRequest(user.id, firm.id).get('/clients/export')
    expect(res.text).toContain('Alice Export')
    expect(res.text).not.toContain('Bob Archived')
  })
})

describe('POST /clients/import', () => {
  it('returns 401 when unauthenticated', async () => {
    expect(
      (
        await api
          .post('/clients/import')
          .attach('file', Buffer.from('name,email,taxYear\nAlice,a@b.com,2024-25'), {
            filename: 'clients.csv',
            contentType: 'text/csv',
          })
      ).status,
    ).toBe(401)
  })
  it('creates clients from valid CSV', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const csv =
      'name,email,taxYear\nAlice Import,alice-import@example.com,2024-25\nBob Import,bob-import@example.com,2023-24'
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients/import')
      .attach('file', Buffer.from(csv), { filename: 'clients.csv', contentType: 'text/csv' })
    expect(res.status).toBe(200)
    expect(res.body.created).toBe(2)
    expect(res.body.errors).toHaveLength(0)
  })
  it('returns errors for invalid rows', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const csv = 'name,email,taxYear\n,notanemail,2024-25'
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients/import')
      .attach('file', Buffer.from(csv), { filename: 'clients.csv', contentType: 'text/csv' })
    expect(res.status).toBe(200)
    expect(res.body.errors.length).toBeGreaterThan(0)
  })
  it('skips invalid rows but creates valid ones', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const csv =
      'name,email,taxYear\nValid User,valid-import-user@example.com,2024-25\n,notanemail,2024-25'
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/clients/import')
      .attach('file', Buffer.from(csv), { filename: 'clients.csv', contentType: 'text/csv' })
    expect(res.status).toBe(200)
    expect(res.body.created).toBe(1)
    expect(res.body.errors.length).toBeGreaterThan(0)
  })
})

describe('GET /clients/:id', () => {
  it('returns 404 for client in another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const userB = await createTestUser(firmB.id)
    const client = await createTestClient(firmA.id)
    expect((await makeAuthedRequest(userB.id, firmB.id).get(`/clients/${client.id}`)).status).toBe(
      404,
    )
  })
  it('returns client with items', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).get(`/clients/${client.id}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.items)).toBe(true)
  })
})

describe('PATCH /clients/:id', () => {
  it('updates and returns client', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id, { name: 'Old' })
    const res = await makeAuthedRequest(user.id, firm.id)
      .patch(`/clients/${client.id}`)
      .send({ name: 'New' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New')
  })
  it('returns 404 for unknown id', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (
        await makeAuthedRequest(user.id, firm.id)
          .patch('/clients/does-not-exist')
          .send({ name: 'X' })
      ).status,
    ).toBe(404)
  })
})

describe('DELETE /clients/:id', () => {
  it('returns 204 and soft-deletes', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).delete(`/clients/${client.id}`)).status).toBe(
      204,
    )
  })
})

describe('POST /clients/:id/items/:itemId/request-revision', () => {
  it('returns 404 for item not belonging to client', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const otherClient = await createTestClient(firm.id)
    const item = await createTestChecklistItem(otherClient.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/items/${item.id}/request-revision`)
      .send({ note: 'Please re-upload' })
    expect(res.status).toBe(404)
  })
  it('clears completedAt and sets revisionNote on the item', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id, { completedAt: new Date() })
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/items/${item.id}/request-revision`)
      .send({ note: 'Please re-upload' })
    expect(res.status).toBe(200)
    expect(res.body.completedAt).toBeNull()
    expect(res.body.revisionNote).toBe('Please re-upload')
  })
  it('returns updated item', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/items/${item.id}/request-revision`)
      .send({ note: 'Fix it' })
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(item.id)
  })
  it('returns 401 when unauthenticated', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    const res = await api
      .post(`/clients/${client.id}/items/${item.id}/request-revision`)
      .send({ note: 'Fix' })
    expect(res.status).toBe(401)
  })
})

describe('POST /clients/:id/clone', () => {
  it('creates new client with same name and email', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id, {
      name: 'Clone Me',
      email: 'clone@example.com',
    })
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/clone`)
      .send({ taxYear: '2025-26' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Clone Me')
    expect(res.body.email).toBe('clone@example.com')
  })
  it('uses provided taxYear', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/clone`)
      .send({ taxYear: '2025-26' })
    expect(res.body.taxYear).toBe('2025-26')
  })
  it('has different portalToken from original', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/clone`)
      .send({ taxYear: '2025-26' })
    expect(res.body.portalToken).not.toBe(client.portalToken)
  })
  it('returns 404 for client from another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const userB = await createTestUser(firmB.id)
    const client = await createTestClient(firmA.id)
    const res = await makeAuthedRequest(userB.id, firmB.id)
      .post(`/clients/${client.id}/clone`)
      .send({ taxYear: '2025-26' })
    expect(res.status).toBe(404)
  })
})

describe('GET /clients/:id/download-zip', () => {
  it('returns 401 when unauthenticated', async () => {
    const firm = await createTestFirm()
    const client = await createTestClient(firm.id)
    expect((await api.get(`/clients/${client.id}/download-zip`)).status).toBe(401)
  })
  it('returns 404 when client has no uploads', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    expect(
      (await makeAuthedRequest(user.id, firm.id).get(`/clients/${client.id}/download-zip`)).status,
    ).toBe(404)
  })
  it('returns zip with correct content-type', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: Readable.from(['PDF content']) as never })
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const item = await createTestChecklistItem(client.id)
    await createTestUpload(item.id)
    const res = await makeAuthedRequest(user.id, firm.id).get(`/clients/${client.id}/download-zip`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/zip')
  })
})
