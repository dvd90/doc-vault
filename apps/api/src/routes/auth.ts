import { Router } from 'express'
import type { Response } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { prisma } from '../lib/prisma'
import { AuthService } from '../services/auth.service'
import { NotificationService } from '../services/notification.service'
import { magicLinkRequestSchema } from '../schemas/auth.schema'

export const authRouter = Router()

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000'

// In production the web and API are served from different domains, so the auth
// cookie must be SameSite=None + Secure to survive cross-site fetch requests.
const isProd = process.env.NODE_ENV === 'production'
const authCookieOptions = {
  httpOnly: true,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  secure: isProd,
}

// Issue a session for the authenticated user. Because the web and API live on
// different domains in production, a cookie set here is invisible to the web
// app's SSR. So we ALSO hand the JWT to the web via /auth/callback, which sets
// its own cookie on the web domain. The API-domain cookie remains for
// client-side fetches made directly to the API.
function issueSessionAndRedirect(res: Response, userId: string, firmId: string) {
  const token = jwt.sign({ userId, firmId }, process.env.JWT_SECRET ?? 'test-secret', {
    expiresIn: (process.env.JWT_EXPIRY ?? '30d') as jwt.SignOptions['expiresIn'],
  })
  res.cookie('token', token, authCookieOptions)
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
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
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    const user = req.user
    if (!user) return res.redirect(`${FRONTEND_URL}/login`)
    issueSessionAndRedirect(res, user.userId, user.firmId)
  },
)

authRouter.post('/magic-link', validate(magicLinkRequestSchema), async (req, res, next) => {
  try {
    const { email } = req.body as { email: string }
    const { token } = await AuthService.createMagicLinkToken(email)
    await NotificationService.sendMagicLink(email, token)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

authRouter.get('/magic-link/callback', async (req, res) => {
  const token = typeof req.query.token === 'string' ? req.query.token : ''
  try {
    const user = await AuthService.consumeMagicLinkToken(token)
    issueSessionAndRedirect(res, user.id, user.firmId)
  } catch {
    res.redirect(`${FRONTEND_URL}/login?error=invalid_link`)
  }
})

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
