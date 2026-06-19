import { makeAuthedRequest } from '../test/helpers'
import {
  createTestFirm,
  createTestUser,
  createTestTemplate,
  createTestClient,
} from '../test/factories'

describe('POST /templates', () => {
  it('creates template with nested items and returns 201', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post('/templates')
      .send({
        name: 'SA Pack',
        items: [{ label: 'P60', required: true, sortOrder: 0 }],
      })
    expect(res.status).toBe(201)
    expect(res.body.items).toHaveLength(1)
  })
  it('returns 400 for empty items', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    expect(
      (
        await makeAuthedRequest(user.id, firm.id)
          .post('/templates')
          .send({ name: 'Pack', items: [] })
      ).status,
    ).toBe(400)
  })
})

describe('GET /templates', () => {
  it('returns only this firms templates', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const user = await createTestUser(firmA.id)
    await createTestTemplate(firmA.id)
    await createTestTemplate(firmB.id)
    const res = await makeAuthedRequest(user.id, firmA.id).get('/templates')
    expect(res.body).toHaveLength(1)
  })
})

describe('POST /clients/:id/apply-template', () => {
  it('applies template and returns updated client with items', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id)
    const client = await createTestClient(firm.id)
    const tmpl = await createTestTemplate(firm.id)
    const res = await makeAuthedRequest(user.id, firm.id)
      .post(`/clients/${client.id}/apply-template`)
      .send({ templateId: tmpl.id })
    expect(res.status).toBe(200)
    expect(res.body.items.length).toBeGreaterThan(0)
  })
  it('returns 404 when template belongs to another firm', async () => {
    const firmA = await createTestFirm()
    const firmB = await createTestFirm()
    const user = await createTestUser(firmA.id)
    const client = await createTestClient(firmA.id)
    const tmpl = await createTestTemplate(firmB.id)
    expect(
      (
        await makeAuthedRequest(user.id, firmA.id)
          .post(`/clients/${client.id}/apply-template`)
          .send({ templateId: tmpl.id })
      ).status,
    ).toBe(404)
  })
})
