import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { UploadService } from '../services/upload.service'
import { NotificationService } from '../services/notification.service'
import { ChecklistService } from '../services/checklist.service'
import { NotFoundError } from '../errors/AppError'

export const portalRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('File type not allowed'))
    }
  },
})

portalRouter.get('/:token', async (req, res, next) => {
  try {
    const client = await prisma.client.findFirst({
      where: { portalToken: req.params.token, archived: false },
      include: {
        items: { orderBy: { sortOrder: 'asc' }, include: { uploads: true } },
        firm: true,
      },
    })
    if (!client) throw new NotFoundError('Portal')

    res.json({
      client: { id: client.id, name: client.name, status: client.status },
      firm: {
        name: client.firm.name,
        accentColor: client.firm.accentColor,
        logoUrl: client.firm.logoUrl,
      },
      items: client.items,
    })
  } catch (err) {
    next(err)
  }
})

portalRouter.post(
  '/:token/upload/:itemId',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: err.message })
      }
      next()
    })
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'No file uploaded' })
      }

      const client = await prisma.client.findFirst({
        where: { portalToken: req.params.token, archived: false },
      })
      if (!client) throw new NotFoundError('Portal')

      const item = await prisma.checklistItem.findFirst({
        where: { id: req.params.itemId, clientId: client.id },
      })
      if (!item) throw new NotFoundError('Item')

      await UploadService.uploadFile({
        checklistItemId: item.id,
        firmId: client.firmId,
        clientId: client.id,
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      })

      const updatedItem = await prisma.checklistItem.update({
        where: { id: item.id },
        data: { completedAt: new Date() },
      })

      NotificationService.sendUploadReceived(item.id).catch(() => undefined)

      const progress = await ChecklistService.getClientProgress(client.id)
      if (progress.percentage === 100) {
        NotificationService.sendChecklistComplete(client.id).catch(() => undefined)
      }

      res.json({ item: updatedItem })
    } catch (err) {
      next(err)
    }
  },
)
