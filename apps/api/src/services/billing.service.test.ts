import { vi } from 'vitest'

vi.mock('../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }) },
    },
    customers: { create: vi.fn().mockResolvedValue({ id: 'cus_test' }) },
    billingPortal: {
      sessions: { create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }) },
    },
  },
}))

import { BillingService } from './billing.service'
import { createTestFirm } from '../test/factories'
import { prisma } from '../lib/prisma'

describe('BillingService', () => {
  describe('createCheckoutSession', () => {
    it('returns a Stripe checkout URL', async () => {
      const firm = await createTestFirm()
      const url = await BillingService.createCheckoutSession(firm.id, 'owner@firm.com')
      expect(url).toBe('https://checkout.stripe.com/test')
    })
    it('includes trial period in session params', async () => {
      const { stripe } = await import('../lib/stripe')
      const firm = await createTestFirm()
      await BillingService.createCheckoutSession(firm.id, 'owner@firm.com')
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_data: expect.objectContaining({ trial_period_days: 14 }),
        }),
      )
    })
  })

  describe('createPortalSession', () => {
    it('returns a Stripe billing portal URL', async () => {
      const firm = await createTestFirm({ stripeCustomerId: 'cus_portal_test' })
      const url = await BillingService.createPortalSession(firm.id)
      expect(url).toBe('https://billing.stripe.com/test')
    })
  })

  describe('handleWebhookEvent', () => {
    it('sets subscriptionStatus to active on subscription.updated', async () => {
      const firm = await createTestFirm({ stripeCustomerId: 'cus_abc' })
      await BillingService.handleWebhookEvent('customer.subscription.updated', {
        customer: 'cus_abc',
        status: 'active',
      })
      const updated = await prisma.firm.findUniqueOrThrow({ where: { id: firm.id } })
      expect(updated.subscriptionStatus).toBe('active')
    })
    it('sets subscriptionStatus to cancelled on subscription.deleted', async () => {
      const firm = await createTestFirm({
        stripeCustomerId: 'cus_abc',
        subscriptionStatus: 'active',
      })
      await BillingService.handleWebhookEvent('customer.subscription.deleted', {
        customer: 'cus_abc',
        status: 'cancelled',
      })
      const updated = await prisma.firm.findUniqueOrThrow({ where: { id: firm.id } })
      expect(updated.subscriptionStatus).toBe('cancelled')
    })
    it('ignores unknown event types without throwing', async () => {
      await expect(BillingService.handleWebhookEvent('invoice.paid', {})).resolves.not.toThrow()
    })
  })
})
