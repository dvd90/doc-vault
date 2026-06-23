import { prisma } from '../lib/prisma'
import { NotFoundError } from '../errors/AppError'

interface CreateWebhookInput {
  url: string
  events: string[]
  secret: string
}

export const WebhookService = {
  async createWebhook(firmId: string, data: CreateWebhookInput) {
    return prisma.webhookEndpoint.create({
      data: {
        firmId,
        url: data.url,
        events: data.events,
        secret: data.secret,
      },
    })
  },

  async listWebhooks(firmId: string) {
    return prisma.webhookEndpoint.findMany({ where: { firmId } })
  },

  async deleteWebhook(firmId: string, id: string) {
    const webhook = await prisma.webhookEndpoint.findUnique({ where: { id } })
    if (!webhook || webhook.firmId !== firmId) {
      throw new NotFoundError('Webhook')
    }
    await prisma.webhookEndpoint.delete({ where: { id } })
  },

  async fireWebhook(firmId: string, event: string, payload: Record<string, unknown>) {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { firmId, events: { has: event } },
    })

    for (const webhook of webhooks) {
      fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret,
        },
        body: JSON.stringify({ event, data: payload, firmId }),
      }).catch(() => undefined)
    }
  },
}
