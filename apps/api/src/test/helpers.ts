import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import { app } from '../app'

export const api = supertest(app)

export function signTestJwt(userId: string, firmId: string): string {
  return jwt.sign({ userId, firmId }, process.env.JWT_SECRET ?? 'test-secret', { expiresIn: '1h' })
}

export function makeAuthedRequest(userId: string, firmId: string) {
  const token = signTestJwt(userId, firmId)
  const cookie = `token=${token}`
  return {
    get: (url: string) => api.get(url).set('Cookie', cookie),
    post: (url: string) => api.post(url).set('Cookie', cookie),
    patch: (url: string) => api.patch(url).set('Cookie', cookie),
    delete: (url: string) => api.delete(url).set('Cookie', cookie),
  }
}
