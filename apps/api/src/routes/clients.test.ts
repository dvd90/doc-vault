import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser, createTestClient } from '../test/factories'

describe('POST /clients', () => {
  it('returns 401 when unauthenticated', async () => {
    expect((await api.post('/clients').send({ name: 'A', email: 'a@b.com', taxYear: '2024-25' })).status).toBe(401)
  })
  it('returns 400 for invalid body', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).post('/clients').send({ name: '' })).status).toBe(400)
  })
  it('creates client and returns 201', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).post('/clients').send({ name: 'Alice', email: 'alice@test.com', taxYear: '2024-25' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Alice')
    expect(res.body.portalToken).toBeDefined()
  })
  it('scopes client to authenticated firm', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).post('/clients').send({ name: 'Alice', email: 'alice@test.com', taxYear: '2024-25' })
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

describe('GET /clients/:id', () => {
  it('returns 404 for client in another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const userB = await createTestUser(firmB.id)
    const client = await createTestClient(firmA.id)
    expect((await makeAuthedRequest(userB.id, firmB.id).get(`/clients/${client.id}`)).status).toBe(404)
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
    const res = await makeAuthedRequest(user.id, firm.id).patch(`/clients/${client.id}`).send({ name: 'New' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New')
  })
  it('returns 404 for unknown id', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).patch('/clients/does-not-exist').send({ name: 'X' })).status).toBe(404)
  })
})

describe('DELETE /clients/:id', () => {
  it('returns 204 and soft-deletes', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).delete(`/clients/${client.id}`)).status).toBe(204)
  })
})
