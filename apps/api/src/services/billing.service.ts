import { stripe } from '../lib/stripe'
import { prisma } from '../lib/prisma'

const TRIAL_DAYS = parseInt(process.env.STRIPE_TRIAL_DAYS ?? '14', 10)
const PRICE_ID = process.env.STRIPE_PRICE_ID ?? 'price_placeholder'
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000'

export const BillingService = {
  async createCheckoutSession(firmId: string, email: string): Promise<string> {
    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })

    let customerId = firm.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email })
      customerId = customer.id
      await prisma.firm.update({ where: { id: firmId }, data: { stripeCustomerId: customerId } })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      subscription_data: { trial_period_days: TRIAL_DAYS },
      success_url: `${FRONTEND_URL}/dashboard?checkout=success`,
      cancel_url: `${FRONTEND_URL}/settings?checkout=cancel`,
    })

    return session.url!
  },

  async createPortalSession(firmId: string): Promise<string> {
    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })
    if (!firm.stripeCustomerId) throw new Error('No Stripe customer')

    const session = await stripe.billingPortal.sessions.create({
      customer: firm.stripeCustomerId,
      return_url: `${FRONTEND_URL}/settings`,
    })

    return session.url
  },

  async handleWebhookEvent(eventType: string, data: Record<string, unknown>): Promise<void> {
    if (
      eventType === 'customer.subscription.updated' ||
      eventType === 'customer.subscription.deleted'
    ) {
      const customerId = data.customer as string
      const status =
        eventType === 'customer.subscription.deleted' ? 'cancelled' : (data.status as string)
      await prisma.firm.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: status },
      })
    }
  },
}
