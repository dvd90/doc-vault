import { z } from 'zod'

export const updateFirmSchema = z
  .object({
    name: z.string().min(1).optional(),
    accentColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' })

export type UpdateFirmInput = z.infer<typeof updateFirmSchema>
