import { Router } from 'express'
import { ReminderService } from '../services/reminder.service'

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
