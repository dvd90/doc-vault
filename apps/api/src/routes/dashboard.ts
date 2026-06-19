import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { prisma } from '../lib/prisma'

export const dashboardRouter = Router()

dashboardRouter.get('/stats', requireAuth, requireSub, async (req, res, next) => {
  try {
    const firmId = req.user!.firmId
    const clients = await prisma.client.findMany({
      where: { firmId, archived: false },
      select: { status: true },
    })

    const stats = {
      total: clients.length,
      notStarted: clients.filter((c) => c.status === 'not_started').length,
      inProgress: clients.filter((c) => c.status === 'in_progress').length,
      complete: clients.filter((c) => c.status === 'complete').length,
    }

    res.json(stats)
  } catch (err) {
    next(err)
  }
})
