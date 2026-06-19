import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'

describe('GET /auth/me', () => {
  it('returns 401 when not authenticated', async () => {
    expect((await api.get('/auth/me')).status).toBe(401)
  })

  it('returns current user and firm', async () => {
    const firm = await createTestFirm({ name: 'ACME CPA' })
    const user = await createTestUser(firm.id, { name: 'Bob Accountant' })
    const res = await makeAuthedRequest(user.id, firm.id).get('/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user.name).toBe('Bob Accountant')
    expect(res.body.firm.name).toBe('ACME CPA')
  })
})

describe('POST /auth/logout', () => {
  it('returns 200', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).post('/auth/logout')).status).toBe(200)
  })

  it('clears the token cookie', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).post('/auth/logout')
    expect(res.headers['set-cookie']?.[0]).toContain('token=;')
  })
})
