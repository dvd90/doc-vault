import type { Profile } from 'passport-google-oauth20'
import { prisma } from '../lib/prisma'

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
}
