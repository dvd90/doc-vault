import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import { requireAuth } from '../middleware/requireAuth'
import { prisma } from '../lib/prisma'
import { AuthService } from '../services/auth.service'

export const authRouter = Router()

// In production the web and API are served from different domains, so the auth
// cookie must be SameSite=None + Secure to survive cross-site fetch requests.
const isProd = process.env.NODE_ENV === 'production'
const authCookieOptions = {
  httpOnly: true,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  secure: isProd,
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await AuthService.findOrCreateUser(profile)
          done(null, { userId: user.id, firmId: user.firmId })
        } catch (err) {
          done(err as Error)
        }
      },
    ),
  )
}

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user
    if (!user) return res.redirect('/login')
    const token = jwt.sign(
      { userId: user.userId, firmId: user.firmId },
      process.env.JWT_SECRET ?? 'test-secret',
      { expiresIn: (process.env.JWT_EXPIRY ?? '30d') as jwt.SignOptions['expiresIn'] },
    )
    res.cookie('token', token, authCookieOptions)
    res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/dashboard`)
  },
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
  res.cookie('token', '', { ...authCookieOptions, maxAge: 0 })
  res.json({ ok: true })
})
