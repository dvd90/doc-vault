import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/requireAuth'
import { requireSub } from '../middleware/requireSub'
import { validate } from '../middleware/validate'
import { prisma } from '../lib/prisma'
import { UploadService } from '../services/upload.service'
import { updateFirmSchema } from '../schemas/firm.schema'

export const firmsRouter = Router()

firmsRouter.use(requireAuth, requireSub)

firmsRouter.patch('/me', validate(updateFirmSchema), async (req, res, next) => {
  try {
    const firm = await prisma.firm.update({
      where: { id: req.user!.firmId },
      data: req.body,
    })
    res.json(firm)
  } catch (err) {
    next(err)
  }
})

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

firmsRouter.post(
  '/me/logo',
  (req, res, next) => {
    logoUpload.single('logo')(req, res, (err) => {
      if (err) return res.status(400).json({ code: 'VALIDATION_ERROR', message: err.message })
      next()
    })
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'No file uploaded' })
      }

      const firmId = req.user!.firmId
      const upload = await UploadService.uploadFile({
        checklistItemId: 'logo',
        firmId,
        clientId: 'firm',
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
      })

      const firm = await prisma.firm.update({
        where: { id: firmId },
        data: { logoUrl: upload.storagePath },
      })

      res.json(firm)
    } catch (err) {
      next(err)
    }
  },
)
