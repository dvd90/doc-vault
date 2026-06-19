import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { pinoHttp } from 'pino-http'
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
}

app.use(errorHandler)
