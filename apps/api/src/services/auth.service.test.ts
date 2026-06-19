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
    await createTestUser(firm.id, {
      googleId: 'google-123',
      name: 'Old Name',
      avatarUrl: 'https://old.url',
    })
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

describe('AuthService.findOrCreateUserByEmail', () => {
  it('creates a new firm and user for an unknown email', async () => {
    const user = await AuthService.findOrCreateUserByEmail('new@accountant.com')
    expect(user.email).toBe('new@accountant.com')
    expect(user.firm).toBeDefined()
    expect(user.googleId).toBeNull()
  })

  it('returns the existing user for a known email without creating a firm', async () => {
    const firm = await createTestFirm()
    const existing = await createTestUser(firm.id, { email: 'known@accountant.com' })
    const user = await AuthService.findOrCreateUserByEmail('known@accountant.com')
    expect(user.id).toBe(existing.id)
    expect(await prisma.firm.count()).toBe(1)
    expect(await prisma.user.count()).toBe(1)
  })

  it('matches email case-insensitively', async () => {
    const firm = await createTestFirm()
    const existing = await createTestUser(firm.id, { email: 'mixed@accountant.com' })
    const user = await AuthService.findOrCreateUserByEmail('Mixed@Accountant.com')
    expect(user.id).toBe(existing.id)
    expect(await prisma.user.count()).toBe(1)
  })
})

describe('AuthService.createMagicLinkToken', () => {
  it('creates a single-use token that expires in the future', async () => {
    const { token } = await AuthService.createMagicLinkToken('owner@firm.com')
    const row = await prisma.magicLinkToken.findUniqueOrThrow({ where: { token } })
    expect(row.email).toBe('owner@firm.com')
    expect(row.usedAt).toBeNull()
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('normalizes the email to lowercase', async () => {
    const { token } = await AuthService.createMagicLinkToken('Owner@Firm.com')
    const row = await prisma.magicLinkToken.findUniqueOrThrow({ where: { token } })
    expect(row.email).toBe('owner@firm.com')
  })

  it('generates a distinct token each call', async () => {
    const a = await AuthService.createMagicLinkToken('a@firm.com')
    const b = await AuthService.createMagicLinkToken('a@firm.com')
    expect(a.token).not.toBe(b.token)
  })
})

describe('AuthService.consumeMagicLinkToken', () => {
  it('returns the user and marks the token used for a valid token', async () => {
    const { token } = await AuthService.createMagicLinkToken('valid@firm.com')
    const user = await AuthService.consumeMagicLinkToken(token)
    expect(user.email).toBe('valid@firm.com')
    const row = await prisma.magicLinkToken.findUniqueOrThrow({ where: { token } })
    expect(row.usedAt).not.toBeNull()
  })

  it('throws for an unknown token', async () => {
    await expect(AuthService.consumeMagicLinkToken('does-not-exist')).rejects.toThrow()
  })

  it('throws for an expired token', async () => {
    const { token } = await AuthService.createMagicLinkToken('expired@firm.com')
    await prisma.magicLinkToken.update({
      where: { token },
      data: { expiresAt: new Date(Date.now() - 1000) },
    })
    await expect(AuthService.consumeMagicLinkToken(token)).rejects.toThrow()
  })

  it('throws when the token was already used', async () => {
    const { token } = await AuthService.createMagicLinkToken('reuse@firm.com')
    await AuthService.consumeMagicLinkToken(token)
    await expect(AuthService.consumeMagicLinkToken(token)).rejects.toThrow()
  })
})
