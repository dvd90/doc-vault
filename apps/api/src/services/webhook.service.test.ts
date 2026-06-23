import { vi } from 'vitest'

// Mock global fetch BEFORE importing WebhookService
const mockFetch = vi.fn().mockResolvedValue({ ok: true })
vi.stubGlobal('fetch', mockFetch)

import { WebhookService } from './webhook.service'
import { createTestFirm } from '../test/factories'

describe('WebhookService.fireWebhook', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs to matching webhook URLs', async () => {
    const firm = await createTestFirm()
    await WebhookService.createWebhook(firm.id, {
      url: 'https://example.com/hook',
      events: ['upload.received'],
      secret: 'sec123',
    })
    await WebhookService.fireWebhook(firm.id, 'upload.received', { clientId: 'abc' })
    // Give the fire-and-forget a tick to run
    await new Promise((r) => setTimeout(r, 10))
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/hook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Webhook-Secret': 'sec123' }),
      }),
    )
  })

  it('does not POST to webhooks not subscribed to the event', async () => {
    const firm = await createTestFirm()
    await WebhookService.createWebhook(firm.id, {
      url: 'https://example.com/hook',
      events: ['checklist.complete'],
      secret: 'sec123',
    })
    await WebhookService.fireWebhook(firm.id, 'upload.received', { clientId: 'abc' })
    await new Promise((r) => setTimeout(r, 10))
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
