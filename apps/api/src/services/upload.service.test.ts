import { mockClient } from 'aws-sdk-client-mock'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { UploadService } from './upload.service'
import { createTestFirm, createTestClient, createTestChecklistItem } from '../test/factories'
import { prisma } from '../lib/prisma'

const s3Mock = mockClient(S3Client)
beforeEach(() => s3Mock.reset())

const filePayload = (firmId: string, clientId: string, itemId: string) => ({
  checklistItemId: itemId,
  firmId,
  clientId,
  buffer: Buffer.from('PDF content'),
  filename: 'p60.pdf',
  mimeType: 'application/pdf',
  fileSize: 11,
})

describe('UploadService', () => {
  describe('uploadFile', () => {
    it('saves Upload record in DB after successful S3 put', async () => {
      s3Mock.on(PutObjectCommand).resolves({})
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const item = await createTestChecklistItem(client.id)
      const upload = await UploadService.uploadFile(filePayload(firm.id, client.id, item.id))
      expect(upload.filename).toBe('p60.pdf')
      expect(await prisma.upload.count()).toBe(1)
    })

    it('S3 key matches pattern uploads/{firmId}/{clientId}/{itemId}/*.pdf', async () => {
      s3Mock.on(PutObjectCommand).resolves({})
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const item = await createTestChecklistItem(client.id)
      await UploadService.uploadFile(filePayload(firm.id, client.id, item.id))
      const key = s3Mock.commandCalls(PutObjectCommand)[0].args[0].input.Key!
      expect(key).toMatch(
        new RegExp(`^uploads/${firm.id}/${client.id}/${item.id}/[a-z0-9-]+\\.pdf$`),
      )
    })

    it('does not save to DB when S3 throws', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('S3 down'))
      const firm = await createTestFirm()
      const client = await createTestClient(firm.id)
      const item = await createTestChecklistItem(client.id)
      await expect(
        UploadService.uploadFile(filePayload(firm.id, client.id, item.id)),
      ).rejects.toThrow('S3 down')
      expect(await prisma.upload.count()).toBe(0)
    })
  })
})
