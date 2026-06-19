import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'test-secret') as {
      userId: string
      firmId: string
    }
    req.user = { userId: payload.userId, firmId: payload.firmId }
    next()
  } catch {
    res.cookie('token', '', { httpOnly: true, maxAge: 0 })
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
  }
}
