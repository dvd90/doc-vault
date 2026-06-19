import { updateFirmSchema } from './firm.schema'

describe('updateFirmSchema', () => {
  it('accepts valid name', () => {
    expect(updateFirmSchema.safeParse({ name: 'Smith CPA' }).success).toBe(true)
  })
  it('accepts valid hex colour', () => {
    expect(updateFirmSchema.safeParse({ accentColor: '#FF5733' }).success).toBe(true)
  })
  it('accepts lowercase hex', () => {
    expect(updateFirmSchema.safeParse({ accentColor: '#ff5733' }).success).toBe(true)
  })
  it('rejects invalid hex colour', () => {
    expect(updateFirmSchema.safeParse({ accentColor: 'notahex' }).success).toBe(false)
  })
  it('rejects hex without hash', () => {
    expect(updateFirmSchema.safeParse({ accentColor: 'FF5733' }).success).toBe(false)
  })
  it('rejects empty object', () => {
    expect(updateFirmSchema.safeParse({}).success).toBe(false)
  })
  it('accepts both fields together', () => {
    expect(updateFirmSchema.safeParse({ name: 'Smith CPA', accentColor: '#185FA5' }).success).toBe(true)
  })
})
