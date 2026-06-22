import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { pinoHttp } from 'pino-http'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { authRouter } from './routes/auth'
import { clientsRouter } from './routes/clients'
import { templatesRouter } from './routes/templates'
import { portalRouter } from './routes/portal'
import { billingRouter } from './routes/billing'
import { dashboardRouter } from './routes/dashboard'
import { firmsRouter } from './routes/firms'
import { internalRouter } from './routes/internal'
import { errorHandler } from './middleware/errorHandler'
import { requireAuth } from './middleware/requireAuth'
import { requireSub } from './middleware/requireSub'
import { prisma } from './lib/prisma'

export const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp())
}

// Stripe webhook must receive raw body before express.json()
app.use('/billing/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/auth', authRouter)
app.use('/clients', clientsRouter)
app.use('/templates', templatesRouter)
app.use('/portal', portalRouter)
app.use('/billing', billingRouter)
app.use('/dashboard', dashboardRouter)
app.use('/firms', firmsRouter)
app.use('/internal', internalRouter)

if (process.env.NODE_ENV === 'test') {
  app.get('/test/protected', requireAuth, (req, res) => res.json(req.user))
  app.get('/test/subscribed', requireAuth, requireSub, (_req, res) => res.json({ ok: true }))

  app.post('/test/seed-user', async (_req, res) => {
    const firm = await prisma.firm.create({
      data: { name: `Firm-${uuid()}`, subscriptionStatus: 'active' },
    })
    const user = await prisma.user.create({
      data: {
        googleId: `g-${uuid()}`,
        email: `u-${uuid()}@test.com`,
        name: 'Test User',
        firmId: firm.id,
      },
    })
    const token = jwt.sign(
      { userId: user.id, firmId: firm.id },
      process.env.JWT_SECRET ?? 'test-secret',
      { expiresIn: '1h' },
    )
    res.json({ token, userId: user.id, firmId: firm.id })
  })

  app.post('/test/seed-client', async (_req, res) => {
    const firm = await prisma.firm.create({
      data: { name: `Firm-${uuid()}`, subscriptionStatus: 'active' },
    })
    const user = await prisma.user.create({
      data: {
        googleId: `g-${uuid()}`,
        email: `u-${uuid()}@test.com`,
        name: 'Test User',
        firmId: firm.id,
      },
    })
    const client = await prisma.client.create({
      data: {
        firmId: firm.id,
        name: 'Test Client',
        email: `c-${uuid()}@test.com`,
        taxYear: '2024-25',
      },
    })
    const item = await prisma.checklistItem.create({
      data: { clientId: client.id, label: 'P60', required: true, sortOrder: 0 },
    })
    const token = jwt.sign(
      { userId: user.id, firmId: firm.id },
      process.env.JWT_SECRET ?? 'test-secret',
      { expiresIn: '1h' },
    )
    res.json({ token, portalToken: client.portalToken, itemId: item.id })
  })
}

app.use(errorHandler)
