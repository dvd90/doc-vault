import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  taxYear: z.string().min(1),
})

export const updateClientSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    taxYear: z.string().min(1).optional(),
    status: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' })

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
