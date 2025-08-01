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
    console.log('Auth header:', authHeader)
    
    const token = authHeader && authHeader.split(' ')[1]
    console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'null')

    if (!token) {
      console.log('No token provided')
      throw createError('Access token required', 401)
    }

    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    console.log('Token decoded successfully:', { userId: decoded.userId, email: decoded.email })
    
    req.user = { id: decoded.userId, email: decoded.email }
    
    next()
  } catch (error) {
    console.error('Auth error:', error instanceof Error ? error.message : error)
    next(createError('Invalid or expired token', 401))
  }
}
