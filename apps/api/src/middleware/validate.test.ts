import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'
import { validate } from './validate'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

function run(body: unknown): Promise<{ status?: number; body?: unknown; next: boolean; reqBody?: unknown }> {
  return new Promise((resolve) => {
    const req = { body } as Request
    const res = {
      status: (code: number) => ({ json: (data: unknown) => resolve({ status: code, body: data, next: false }) }),
    } as unknown as Response
    const next = () => resolve({ next: true, reqBody: req.body })
    validate(schema)(req, res, next as NextFunction)
  })
}

describe('validate middleware', () => {
  it('calls next() when body is valid', async () => {
    const result = await run({ name: 'Jane', email: 'jane@test.com' })
    expect(result.next).toBe(true)
  })

  it('returns 400 when body is invalid', async () => {
    const result = await run({ name: '', email: 'not-email' })
    expect(result.status).toBe(400)
    expect(result.body).toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('returns 400 when required fields are missing', async () => {
    const result = await run({})
    expect(result.status).toBe(400)
  })

  it('strips unknown fields from req.body', async () => {
    const result = await run({ name: 'Jane', email: 'jane@test.com', injected: 'bad' })
    expect((result.reqBody as Record<string, unknown>)?.injected).toBeUndefined()
  })
})
