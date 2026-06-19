import { Router } from 'express'
import { ReminderService } from '../services/reminder.service'
import { prisma } from '../lib/prisma'

export const internalRouter = Router()

internalRouter.post('/reminders/send', async (req, res, next) => {
  const secret = req.headers['x-cron-secret']
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid cron secret' })
  }

  try {
    const sent = await ReminderService.sendPendingReminders()
    res.json({ sent })
  } catch (err) {
    next(err)
  }
})

function requireAdmin(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  const secret = req.headers['x-admin-secret']
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid admin secret' })
  }
  next()
}

internalRouter.get('/admin/stats', requireAdmin, async (_req, res, next) => {
  try {
    const [totalFirms, totalClients, totalUploads, firmsByStatus] = await Promise.all([
      prisma.firm.count(),
      prisma.client.count({ where: { archived: false } }),
      prisma.upload.count(),
      prisma.firm.groupBy({ by: ['subscriptionStatus'], _count: { id: true } }),
    ])

    const bySubscription: Record<string, number> = {}
    for (const row of firmsByStatus) {
      bySubscription[row.subscriptionStatus] = row._count.id
    }

    res.json({ totalFirms, totalClients, totalUploads, bySubscription })
  } catch (err) {
    next(err)
  }
})

internalRouter.get('/admin/firms', requireAdmin, async (_req, res, next) => {
  try {
    const firms = await prisma.firm.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true, clients: true } } },
    })
    res.json(firms)
  } catch (err) {
    next(err)
  }
})

internalRouter.get('/admin/firms/:id', requireAdmin, async (req, res, next) => {
  try {
    const firm = await prisma.firm.findUnique({
      where: { id: req.params.id },
      include: {
        users: { select: { id: true, name: true, email: true, createdAt: true } },
        clients: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: { uploads: { orderBy: { uploadedAt: 'desc' }, take: 5 } },
            },
          },
        },
      },
    })
    if (!firm) return res.status(404).json({ code: 'NOT_FOUND', message: 'Firm not found' })
    res.json(firm)
  } catch (err) {
    next(err)
  }
})
