import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import { requireAuth } from '../middleware/requireAuth'
import { prisma } from '../lib/prisma'
import { AuthService } from '../services/auth.service'

export const authRouter = Router()

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await AuthService.findOrCreateUser(profile)
          done(null, user)
        } catch (err) {
          done(err as Error)
        }
      }
    )
  )
}

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as { id: string; firmId: string } | undefined
    if (!user) return res.redirect('/login')
    const token = jwt.sign(
      { userId: user.id, firmId: user.firmId },
      process.env.JWT_SECRET ?? 'test-secret',
      { expiresIn: process.env.JWT_EXPIRY ?? '30d' }
    )
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
    res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/dashboard`)
  }
)

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId } })
    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: req.user!.firmId } })
    res.json({ user, firm })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/logout', requireAuth, (_req, res) => {
  res.cookie('token', '', { httpOnly: true, maxAge: 0 })
  res.json({ ok: true })
})
