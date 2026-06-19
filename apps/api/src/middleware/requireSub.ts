import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export async function requireSub(req: Request, res: Response, next: NextFunction) {
  const firmId = req.user?.firmId
  if (!firmId) return res.status(401).json({ code: 'UNAUTHORIZED' })

  const firm = await prisma.firm.findUnique({ where: { id: firmId } })
  if (!firm) return res.status(401).json({ code: 'UNAUTHORIZED' })

  if (firm.subscriptionStatus === 'cancelled' || firm.subscriptionStatus === 'past_due') {
    return res.status(402).json({ code: 'PAYMENT_REQUIRED', message: 'Active subscription required' })
  }
  next()
}
