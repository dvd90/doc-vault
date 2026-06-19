import { magicLinkRequestSchema } from './auth.schema'

describe('magicLinkRequestSchema', () => {
  it('accepts a valid email', () => {
    expect(magicLinkRequestSchema.safeParse({ email: 'jane@firm.com' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(magicLinkRequestSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects a missing email', () => {
    expect(magicLinkRequestSchema.safeParse({}).success).toBe(false)
  })
})
