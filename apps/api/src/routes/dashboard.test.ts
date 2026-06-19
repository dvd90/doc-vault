import { makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser, createTestClient } from '../test/factories'

describe('GET /dashboard/stats', () => {
  it('returns counts by status', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    await createTestClient(firm.id, { status: 'not_started' })
    await createTestClient(firm.id, { status: 'in_progress' })
    await createTestClient(firm.id, { status: 'complete' })
    await createTestClient(firm.id, { status: 'complete' })
    const res = await makeAuthedRequest(user.id, firm.id).get('/dashboard/stats')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ total: 4, notStarted: 1, inProgress: 1, complete: 2 })
  })

  it('excludes archived clients', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    await createTestClient(firm.id, { status: 'in_progress' })
    await createTestClient(firm.id, { status: 'in_progress', archived: true })
    const res = await makeAuthedRequest(user.id, firm.id).get('/dashboard/stats')
    expect(res.body.total).toBe(1)
  })

  it('returns 401 when not authenticated', async () => {
    const { api } = await import('../test/helpers')
    expect((await api.get('/dashboard/stats')).status).toBe(401)
  })
})
