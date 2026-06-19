import { Router } from 'express'
import { stripe } from '../lib/stripe'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { BillingService } from '../services/billing.service'

export const billingRouter = Router()

billingRouter.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const { prisma } = await import('../lib/prisma')
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId } })
    const url = await BillingService.createCheckoutSession(req.user!.firmId, user.email)
    res.json({ url })
  } catch (err) {
    next(err)
  }
})

billingRouter.post('/portal', requireAuth, requireSub, async (req, res, next) => {
  try {
    const url = await BillingService.createPortalSession(req.user!.firmId)
    res.json({ url })
  } catch (err) {
    next(err)
  }
})

billingRouter.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature']
  if (!sig) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Missing stripe-signature header' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_placeholder',
    )
  } catch (err) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Invalid signature' })
  }

  try {
    await BillingService.handleWebhookEvent(
      event.type,
      event.data.object as Record<string, unknown>,
    )
    res.json({ received: true })
  } catch (err) {
    next(err)
  }
})
