import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { validate } from '../middleware/validate'
import { WebhookService } from '../services/webhook.service'

export const webhooksRouter = Router()

webhooksRouter.use(requireAuth, requireSub)

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(1),
})

webhooksRouter.get('/', async (req, res, next) => {
  try {
    const webhooks = await WebhookService.listWebhooks(req.user!.firmId)
    res.json(webhooks)
  } catch (err) {
    next(err)
  }
})

webhooksRouter.post('/', validate(createWebhookSchema), async (req, res, next) => {
  try {
    const webhook = await WebhookService.createWebhook(req.user!.firmId, req.body)
    res.status(201).json(webhook)
  } catch (err) {
    next(err)
  }
})

webhooksRouter.delete('/:id', async (req, res, next) => {
  try {
    await WebhookService.deleteWebhook(req.user!.firmId, req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
