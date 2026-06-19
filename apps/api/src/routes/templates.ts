import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { validate } from '../middleware/validate'
import { ChecklistService } from '../services/checklist.service'
import { createTemplateSchema, updateTemplateSchema } from '../schemas/template.schema'

export const templatesRouter = Router()

templatesRouter.use(requireAuth, requireSub)

templatesRouter.post('/', validate(createTemplateSchema), async (req, res, next) => {
  try {
    const tmpl = await ChecklistService.createTemplate(req.user!.firmId, req.body)
    res.status(201).json(tmpl)
  } catch (err) {
    next(err)
  }
})

templatesRouter.get('/', async (req, res, next) => {
  try {
    res.json(await ChecklistService.findAllTemplates(req.user!.firmId))
  } catch (err) {
    next(err)
  }
})

templatesRouter.patch('/:id', validate(updateTemplateSchema), async (req, res, next) => {
  try {
    res.json(await ChecklistService.updateTemplate(req.user!.firmId, req.params.id, req.body))
  } catch (err) {
    next(err)
  }
})

templatesRouter.delete('/:id', async (req, res, next) => {
  try {
    await ChecklistService.deleteTemplate(req.user!.firmId, req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
