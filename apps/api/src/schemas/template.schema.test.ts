import { createTemplateSchema } from './template.schema'

describe('createTemplateSchema', () => {
  it('accepts valid template with items', () => {
    expect(createTemplateSchema.safeParse({
      name: 'SA Pack',
      items: [{ label: 'P60', required: true, sortOrder: 0 }],
    }).success).toBe(true)
  })
  it('rejects empty items array', () => {
    expect(createTemplateSchema.safeParse({ name: 'Pack', items: [] }).success).toBe(false)
  })
  it('rejects blank name', () => {
    expect(createTemplateSchema.safeParse({ name: '', items: [{ label: 'P60' }] }).success).toBe(false)
  })
  it('rejects item with blank label', () => {
    expect(createTemplateSchema.safeParse({ name: 'Pack', items: [{ label: '' }] }).success).toBe(false)
  })
})
