import { prisma } from '../lib/prisma'
import { NotificationService } from './notification.service'

const OVERDUE_DAYS = 7

export const ReminderService = {
  async getOverdueClients() {
    const cutoff = new Date(Date.now() - OVERDUE_DAYS * 24 * 60 * 60 * 1000)
    return prisma.client.findMany({
      where: {
        archived: false,
        status: { not: 'complete' },
        createdAt: { lt: cutoff },
      },
    })
  },

  async sendPendingReminders(): Promise<number> {
    const clients = await ReminderService.getOverdueClients()
    await Promise.all(clients.map((c) => NotificationService.sendReminderToClient(c.id)))
    return clients.length
  },
}
