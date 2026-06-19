import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { validate } from '../middleware/validate'
import { ClientService } from '../services/client.service'
import { ChecklistService } from '../services/checklist.service'
import { NotificationService } from '../services/notification.service'
import { createClientSchema, updateClientSchema } from '../schemas/client.schema'
import { z } from 'zod'

export const clientsRouter = Router()

clientsRouter.use(requireAuth, requireSub)

clientsRouter.post('/', validate(createClientSchema), async (req, res, next) => {
  try {
    const client = await ClientService.create(req.user!.firmId, req.body)
    res.status(201).json(client)
  } catch (err) {
    next(err)
  }
})

clientsRouter.get('/', async (req, res, next) => {
  try {
    res.json(await ClientService.findAll(req.user!.firmId))
  } catch (err) {
    next(err)
  }
})

clientsRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await ClientService.findById(req.user!.firmId, req.params.id))
  } catch (err) {
    next(err)
  }
})

clientsRouter.patch('/:id', validate(updateClientSchema), async (req, res, next) => {
  try {
    res.json(await ClientService.update(req.user!.firmId, req.params.id, req.body))
  } catch (err) {
    next(err)
  }
})

clientsRouter.delete('/:id', async (req, res, next) => {
  try {
    await ClientService.archive(req.user!.firmId, req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

clientsRouter.post(
  '/:id/apply-template',
  validate(z.object({ templateId: z.string().min(1) })),
  async (req, res, next) => {
    try {
      const client = await ChecklistService.applyTemplateToClient(
        req.user!.firmId,
        req.params.id,
        req.body.templateId,
      )
      res.json(client)
    } catch (err) {
      next(err)
    }
  },
)

clientsRouter.post('/:id/invite', async (req, res, next) => {
  try {
    await NotificationService.sendPortalInvite(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

clientsRouter.post('/:id/remind', async (req, res, next) => {
  try {
    await NotificationService.sendReminderToClient(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
