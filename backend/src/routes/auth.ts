import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { createError } from '../middleware/errorHandler'

const router = express.Router()
const prisma = new PrismaClient()

// Register (uses try/catch for async error handling)
router.post('/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 1 }).optional()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try { // All async logic is wrapped in try/catch for robust error handling
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { email, password, name } = req.body

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw createError('User already exists with this email', 409)
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null
        }
      })

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: null
        },
        token
      })
    } catch (error) {
      next(error) // Pass errors to centralized error handler middleware
    }
  }
)

// Login (uses try/catch for async error handling)
router.post('/signin',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try { // All async logic is wrapped in try/catch for robust error handling
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { email, password } = req.body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw createError('Invalid email or password', 401)
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401)
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      // Get avatarUrl separately using raw query
      const avatarResult = await prisma.$queryRaw`SELECT avatarUrl FROM users WHERE id = ${user.id}` as any
      const avatarUrl = avatarResult[0]?.avatarUrl || null

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl
        },
        token
      })
    } catch (error) {
      next(error) // Pass errors to centralized error handler middleware
    }
  }
)

export default router
