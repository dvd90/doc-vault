import { vi } from 'vitest'

vi.mock('../services/notification.service', () => ({
  NotificationService: { sendMagicLink: vi.fn().mockResolvedValue(undefined) },
}))

import { api, makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'
import { prisma } from '../lib/prisma'
import { AuthService } from '../services/auth.service'

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

describe('POST /auth/magic-link', () => {
  it('returns 400 for an invalid email', async () => {
    const res = await api.post('/auth/magic-link').send({ email: 'nope' })
    expect(res.status).toBe(400)
  })

  it('creates a token and emails it, returning 200', async () => {
    const { NotificationService } = await import('../services/notification.service')
    const res = await api.post('/auth/magic-link').send({ email: 'owner@firm.com' })
    expect(res.status).toBe(200)
    expect(await prisma.magicLinkToken.count()).toBe(1)
    expect(NotificationService.sendMagicLink).toHaveBeenCalledWith(
      'owner@firm.com',
      expect.any(String),
    )
  })
})

describe('GET /auth/magic-link/callback', () => {
  it('redirects to the web handoff with a JWT and sets the cookie for a valid token', async () => {
    const { token } = await AuthService.createMagicLinkToken('valid@firm.com')
    const res = await api.get(`/auth/magic-link/callback?token=${token}`)
    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('/auth/callback?token=')
    expect(res.headers['set-cookie']?.[0]).toContain('token=')
  })

  it('redirects to login with an error for an invalid token', async () => {
    const res = await api.get('/auth/magic-link/callback?token=bogus')
    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('/login')
  })

  it('redirects to login when no token is provided', async () => {
    const res = await api.get('/auth/magic-link/callback')
    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('/login')
  })
})
