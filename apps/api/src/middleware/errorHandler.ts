import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message })
  }
  console.error(err)
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' })
}
