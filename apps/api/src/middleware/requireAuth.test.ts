import { api, signTestJwt } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'
import jwt from 'jsonwebtoken'

describe('requireAuth', () => {
  it('returns 401 when no cookie', async () => {
    expect((await api.get('/test/protected')).status).toBe(401)
  })

  it('returns 401 for invalid JWT', async () => {
    const res = await api.get('/test/protected').set('Cookie', 'token=bad.jwt')
    expect(res.status).toBe(401)
  })

  it('returns 401 for expired JWT', async () => {
    const expired = jwt.sign({ userId: 'u', firmId: 'f' }, process.env.JWT_SECRET!, { expiresIn: '-1s' })
    const res = await api.get('/test/protected').set('Cookie', `token=${expired}`)
    expect(res.status).toBe(401)
  })

  it('attaches user and calls next for valid JWT', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const token = signTestJwt(user.id, firm.id)
    const res = await api.get('/test/protected').set('Cookie', `token=${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ userId: user.id, firmId: firm.id })
  })

  it('clears cookie when JWT is invalid', async () => {
    const res = await api.get('/test/protected').set('Cookie', 'token=bad')
    const setCookie = res.headers['set-cookie']?.[0] ?? ''
    expect(setCookie).toContain('token=;')
  })
})
