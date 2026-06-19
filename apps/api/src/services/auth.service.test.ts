import { AuthService } from './auth.service'
import { prisma } from '../lib/prisma'
import { createTestFirm, createTestUser } from '../test/factories'
import type { Profile } from 'passport-google-oauth20'

const googleProfile = {
  id: 'google-123',
  displayName: 'Jane Smith',
  emails: [{ value: 'jane@example.com' }],
  photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
} as unknown as Profile

describe('AuthService.findOrCreateUser', () => {
  it('creates new user and firm on first login', async () => {
    const user = await AuthService.findOrCreateUser(googleProfile)
    expect(user.googleId).toBe('google-123')
    expect(user.email).toBe('jane@example.com')
    expect(user.firm).toBeDefined()
  })

  it('returns existing user on repeat login', async () => {
    const firm = await createTestFirm()
    const existing = await createTestUser(firm.id, { googleId: 'google-123' })
    const user = await AuthService.findOrCreateUser(googleProfile)
    expect(user.id).toBe(existing.id)
    expect(await prisma.user.count()).toBe(1)
  })

  it('updates name and avatar if changed', async () => {
    const firm = await createTestFirm()
    await createTestUser(firm.id, { googleId: 'google-123', name: 'Old Name', avatarUrl: 'https://old.url' })
    const user = await AuthService.findOrCreateUser(googleProfile)
    expect(user.name).toBe('Jane Smith')
    expect(user.avatarUrl).toBe('https://lh3.googleusercontent.com/photo.jpg')
  })

  it('does not create a second firm on repeat login', async () => {
    const firm = await createTestFirm()
    await createTestUser(firm.id, { googleId: 'google-123' })
    await AuthService.findOrCreateUser(googleProfile)
    expect(await prisma.firm.count()).toBe(1)
  })
})
