import { makeAuthedRequest } from '../test/helpers'
import { createTestFirm, createTestUser } from '../test/factories'
import { WebhookService } from '../services/webhook.service'

describe('GET /webhooks', () => {
  it('returns firm webhooks', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    await WebhookService.createWebhook(firm.id, {
      url: 'https://example.com/hook',
      events: ['upload.received'],
      secret: 'sec',
    })
    const res = await makeAuthedRequest(user.id, firm.id).get('/webhooks')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })
})

describe('POST /webhooks', () => {
  it('creates webhook', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/webhooks')
      .send({ url: 'https://example.com/hook', events: ['upload.received'], secret: 'mysecret' })
    expect(res.status).toBe(201)
    expect(res.body.url).toBe('https://example.com/hook')
  })
  it('returns 400 for invalid url', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/webhooks')
      .send({ url: 'not-a-url', events: ['upload.received'], secret: 'sec' })
    expect(res.status).toBe(400)
  })
})

describe('DELETE /webhooks/:id', () => {
  it('deletes webhook', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const webhook = await WebhookService.createWebhook(firm.id, {
      url: 'https://example.com/hook',
      events: ['upload.received'],
      secret: 'sec',
    })
    const res = await makeAuthedRequest(user.id, firm.id).delete(`/webhooks/${webhook.id}`)
    expect(res.status).toBe(204)
  })
  it('returns 404 for another firm webhook', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const userB = await createTestUser(firmB.id)
    const webhook = await WebhookService.createWebhook(firmA.id, {
      url: 'https://example.com/hook',
      events: ['upload.received'],
      secret: 'sec',
    })
    const res = await makeAuthedRequest(userB.id, firmB.id).delete(`/webhooks/${webhook.id}`)
    expect(res.status).toBe(404)
  })
})
