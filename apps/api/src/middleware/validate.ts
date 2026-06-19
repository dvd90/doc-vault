import { z } from 'zod'
import type { Request, Response, NextFunction } from 'express'

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', errors: result.error.flatten() })
    }
    req.body = result.data
    next()
  }
}
