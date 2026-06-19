import { z } from 'zod'

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        description: z.string().optional(),
        required: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .min(1),
})

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
})

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
