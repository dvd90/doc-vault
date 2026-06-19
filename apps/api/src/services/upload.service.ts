import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'
import { s3 } from '../lib/s3'
import { prisma } from '../lib/prisma'

interface UploadFileInput {
  checklistItemId: string
  firmId: string
  clientId: string
  buffer: Buffer
  filename: string
  mimeType: string
  fileSize: number
}

export const UploadService = {
  async uploadFile(input: UploadFileInput) {
    const ext = input.filename.split('.').pop() ?? 'bin'
    const key = `uploads/${input.firmId}/${input.clientId}/${input.checklistItemId}/${uuid()}.${ext}`

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET ?? 'docvault-dev',
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
      })
    )

    return prisma.upload.create({
      data: {
        checklistItemId: input.checklistItemId,
        storagePath: key,
        filename: input.filename,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
      },
    })
  },
}
