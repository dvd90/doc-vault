import { vi } from 'vitest'

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: vi.fn().mockResolvedValue({ url: 'https://stripe.com/pay' }) },
    },
    customers: { create: vi.fn().mockResolvedValue({ id: 'cus_test' }) },
    webhooks: { constructEvent: vi.fn() },
  },
}))

import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'

describe('POST /billing/checkout', () => {
  it('returns 401 when unauthenticated', async () => {
    expect((await api.post('/billing/checkout')).status).toBe(401)
  })
  it('returns checkout URL', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id).post('/billing/checkout')
    expect(res.status).toBe(200)
    expect(res.body.url).toContain('stripe.com')
  })
})

describe('POST /billing/webhook', () => {
  it('returns 400 when Stripe signature header is missing', async () => {
    expect((await api.post('/billing/webhook').send('{}')).status).toBe(400)
  })
})
