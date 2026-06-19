import { prisma } from './prisma'
import { createTestFirm, createTestUser } from '../test/factories'

describe('database connectivity', () => {
  it('can create and read a firm', async () => {
    const firm = await createTestFirm({ name: 'ACME Accounting' })
    const found = await prisma.firm.findUniqueOrThrow({ where: { id: firm.id } })
    expect(found.name).toBe('ACME Accounting')
    expect(found.subscriptionStatus).toBe('active')
  })

  it('user and firm are linked', async () => {
    const firm = await createTestFirm()
    const user = await createTestUser(firm.id, { name: 'Jane CPA' })
    const found = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { firm: true },
    })
    expect(found.firm.id).toBe(firm.id)
    expect(found.name).toBe('Jane CPA')
  })

  it('portalToken is auto-generated on client creation', async () => {
    const firm = await createTestFirm()
    const client = await prisma.client.create({
      data: { firmId: firm.id, name: 'Bob', email: 'bob@test.com', taxYear: '2024-25' },
    })
    expect(client.portalToken).toBeDefined()
    expect(client.portalToken.length).toBeGreaterThan(10)
  })

  it('two clients get different portalTokens', async () => {
    const firm = await createTestFirm()
    const c1 = await prisma.client.create({
      data: { firmId: firm.id, name: 'A', email: 'a@t.com', taxYear: '2024-25' },
    })
    const c2 = await prisma.client.create({
      data: { firmId: firm.id, name: 'B', email: 'b@t.com', taxYear: '2024-25' },
    })
    expect(c1.portalToken).not.toBe(c2.portalToken)
  })
})
