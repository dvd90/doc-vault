import { Router } from 'express'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAuth } from '../middleware/requireAuth'
import { NotFoundError } from '../errors/AppError'
import { prisma } from '../lib/prisma'
import { s3 } from '../lib/s3'

export const uploadsRouter = Router()

uploadsRouter.use(requireAuth)

uploadsRouter.get('/:uploadId/view', async (req, res, next) => {
  try {
    const upload = await prisma.upload.findUnique({
      where: { id: req.params.uploadId },
      include: {
        checklistItem: {
          include: { client: true },
        },
      },
    })

    if (!upload || upload.checklistItem.client.firmId !== req.user!.firmId) {
      throw new NotFoundError('Upload')
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET ?? 'docvault-dev',
      Key: upload.storagePath,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 60 })

    res.json({ url })
  } catch (err) {
    next(err)
  }
})
