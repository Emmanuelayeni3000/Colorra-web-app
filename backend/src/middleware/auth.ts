import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      throw createError('Access token required', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = { id: decoded.userId, email: decoded.email }
    
    next()
  } catch (error) {
    next(createError('Invalid or expired token', 401))
  }
}
