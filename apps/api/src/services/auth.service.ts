import type { Profile } from 'passport-google-oauth20'
import { randomBytes } from 'crypto'
import { prisma } from '../lib/prisma'
import { UnauthorizedError } from '../errors/AppError'

const MAGIC_LINK_TTL_MS = 60 * 60 * 1000 // 1 hour

export const AuthService = {
  async findOrCreateUser(profile: Profile) {
    const googleId = profile.id
    const email = profile.emails?.[0]?.value ?? ''
    const name = profile.displayName
    const avatarUrl = profile.photos?.[0]?.value ?? null

    const existing = await prisma.user.findUnique({
      where: { googleId },
      include: { firm: true },
    })

    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { name, avatarUrl },
        include: { firm: true },
      })
    }

    const firm = await prisma.firm.create({
      data: { name: `${name}'s Firm`, subscriptionStatus: 'trial' },
    })

    return prisma.user.create({
      data: { googleId, email, name, avatarUrl, firmId: firm.id },
      include: { firm: true },
    })
  },

  async findOrCreateUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({
      where: { email: normalized },
      include: { firm: true },
    })

    if (existing) return existing

    const name = normalized.split('@')[0]
    const firm = await prisma.firm.create({
      data: { name: `${name}'s Firm`, subscriptionStatus: 'trial' },
    })

    return prisma.user.create({
      data: { email: normalized, name, firmId: firm.id },
      include: { firm: true },
    })
  },

  async createMagicLinkToken(email: string) {
    const normalized = email.trim().toLowerCase()
    const token = randomBytes(32).toString('hex')
    await prisma.magicLinkToken.create({
      data: {
        email: normalized,
        token,
        expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
      },
    })
    return { token, email: normalized }
  },

  async consumeMagicLinkToken(token: string) {
    const row = await prisma.magicLinkToken.findUnique({ where: { token } })
    if (!row) throw new UnauthorizedError('Invalid or expired link')
    if (row.usedAt) throw new UnauthorizedError('This link has already been used')
    if (row.expiresAt.getTime() < Date.now()) throw new UnauthorizedError('This link has expired')

    await prisma.magicLinkToken.update({
      where: { token },
      data: { usedAt: new Date() },
    })

    return this.findOrCreateUserByEmail(row.email)
  },
}
