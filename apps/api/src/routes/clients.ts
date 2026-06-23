import { Router } from 'express'
import multer from 'multer'
import { ZipArchive } from 'archiver'
import { parse } from 'csv-parse/sync'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { validate } from '../middleware/validate'
import { ClientService } from '../services/client.service'
import { ChecklistService } from '../services/checklist.service'
import { NotificationService } from '../services/notification.service'
import { createClientSchema, updateClientSchema } from '../schemas/client.schema'
import { NotFoundError } from '../errors/AppError'
import { prisma } from '../lib/prisma'
import { s3 } from '../lib/s3'
import { z } from 'zod'

export const clientsRouter = Router()

const upload = multer({ storage: multer.memoryStorage() })

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

// NOTE: /export and /import must come BEFORE /:id to avoid "export"/"import" being treated as id
clientsRouter.get('/export', async (req, res, next) => {
  try {
    const clients = await ClientService.findAll(req.user!.firmId)
    const header = 'name,email,taxYear,status,createdAt'
    const rows = clients.map((c) =>
      [c.name, c.email, c.taxYear, c.status, c.createdAt.toISOString()].join(','),
    )
    const csv = [header, ...rows].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"')
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

clientsRouter.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'No file uploaded' })
    }

    const csvText = req.file.buffer.toString('utf-8')
    let rows: Record<string, string>[]
    try {
      rows = parse(csvText, { columns: true, skip_empty_lines: true }) as Record<string, string>[]
    } catch {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid CSV' })
    }

    const createSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      taxYear: z.string().min(1),
    })

    let created = 0
    const errors: Array<{ row: number; message: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const parsed = createSchema.safeParse({
        name: row['name'],
        email: row['email'],
        taxYear: row['taxYear'],
      })
      if (!parsed.success) {
        errors.push({ row: i + 2, message: parsed.error.errors[0].message })
        continue
      }
      try {
        await ClientService.create(req.user!.firmId, parsed.data)
        created++
      } catch (err) {
        errors.push({ row: i + 2, message: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    res.json({ created, errors })
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

clientsRouter.post(
  '/:id/items/:itemId/request-revision',
  validate(z.object({ note: z.string().min(1) })),
  async (req, res, next) => {
    try {
      const { id: clientId, itemId } = req.params
      const { note } = req.body as { note: string }

      // Verify client belongs to firm
      const client = await prisma.client.findFirst({
        where: { id: clientId, firmId: req.user!.firmId },
      })
      if (!client) throw new NotFoundError('Client')

      // Verify item belongs to client
      const item = await prisma.checklistItem.findFirst({
        where: { id: itemId, clientId },
      })
      if (!item) throw new NotFoundError('Item')

      const updatedItem = await prisma.checklistItem.update({
        where: { id: itemId },
        data: { completedAt: null, revisionNote: note },
      })

      NotificationService.sendRevisionRequest(itemId, note).catch(() => undefined)

      res.json(updatedItem)
    } catch (err) {
      next(err)
    }
  },
)

clientsRouter.post(
  '/:id/clone',
  validate(z.object({ taxYear: z.string().min(1) })),
  async (req, res, next) => {
    try {
      const source = await prisma.client.findFirst({
        where: { id: req.params.id, firmId: req.user!.firmId },
      })
      if (!source) throw new NotFoundError('Client')

      const cloned = await ClientService.create(req.user!.firmId, {
        name: source.name,
        email: source.email,
        taxYear: req.body.taxYear,
      })
      res.status(201).json(cloned)
    } catch (err) {
      next(err)
    }
  },
)

clientsRouter.get('/:id/download-zip', async (req, res, next) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, firmId: req.user!.firmId },
      include: {
        items: {
          include: { uploads: true },
        },
      },
    })
    if (!client) throw new NotFoundError('Client')

    const allUploads = client.items.flatMap((item) => item.uploads)
    if (allUploads.length === 0) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'No uploads found' })
    }

    const archive = new ZipArchive({ zlib: { level: 9 } })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="client-${client.name}-docs.zip"`)

    archive.pipe(res)

    for (const upload of allUploads) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET ?? 'docvault-dev',
        Key: upload.storagePath,
      })
      const response = await s3.send(command)
      if (response.Body) {
        archive.append(response.Body as Readable, { name: upload.filename })
      }
    }

    await archive.finalize()
  } catch (err) {
    next(err)
  }
})
