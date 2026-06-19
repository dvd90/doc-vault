import { createClientSchema, updateClientSchema } from './client.schema'

describe('createClientSchema', () => {
  it('accepts valid data', () => {
    expect(createClientSchema.safeParse({ name: 'Alice', email: 'alice@example.com', taxYear: '2024-25' }).success).toBe(true)
  })
  it('rejects missing name', () => {
    expect(createClientSchema.safeParse({ email: 'a@b.com', taxYear: '2024-25' }).success).toBe(false)
  })
  it('rejects invalid email', () => {
    expect(createClientSchema.safeParse({ name: 'Alice', email: 'not-email', taxYear: '2024-25' }).success).toBe(false)
  })
  it('rejects empty taxYear', () => {
    expect(createClientSchema.safeParse({ name: 'Alice', email: 'a@b.com', taxYear: '' }).success).toBe(false)
  })
})

describe('updateClientSchema', () => {
  it('accepts partial update', () => {
    expect(updateClientSchema.safeParse({ name: 'New' }).success).toBe(true)
  })
  it('rejects empty object', () => {
    expect(updateClientSchema.safeParse({}).success).toBe(false)
  })
})
