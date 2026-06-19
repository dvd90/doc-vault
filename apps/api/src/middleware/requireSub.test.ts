import { createTestFirm, createTestUser } from '../test/factories'
import { makeAuthedRequest } from '../test/helpers'

describe('requireSub', () => {
  it('returns 402 when subscription is cancelled', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'cancelled' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(402)
  })

  it('returns 402 when subscription is past_due', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'past_due' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(402)
  })

  it('allows through when active', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'active' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(200)
  })

  it('allows through when trial', async () => {
    const firm = await createTestFirm({ subscriptionStatus: 'trial' })
    const user = await createTestUser(firm.id)
    expect((await makeAuthedRequest(user.id, firm.id).get('/test/subscribed')).status).toBe(200)
  })

  it('returns 401 when firmId in JWT does not exist', async () => {
    const res = await makeAuthedRequest('any-user', 'nonexistent-firm').get('/test/subscribed')
    expect(res.status).toBe(401)
  })
})
