import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { createError } from '../middleware/errorHandler'
import { sendVerificationEmail } from '../services/emailService'
import { authenticateToken } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()
const prisma = new PrismaClient()

// Register (with email verification)
router.post('/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 1 }).optional()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      // Generate verification token
      const verificationToken = uuidv4()
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create user with emailVerified = false
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          emailVerified: false,
          verificationToken,
          verificationTokenExpiry
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true
            }
          }
        }
      })

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken, name)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Don't fail signup if email fails - user can resend later
      }

      res.status(201).json({
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        }
      })
    } catch (error) {
      next(error)
    }
  }
)

// Verify email with token
router.get('/verify-email',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query

      if (!token || typeof token !== 'string') {
        throw createError('Verification token is required', 400)
      }

      // Find user with this token
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpiry: {
            gt: new Date()
          }
        }
      })

      if (!user) {
        throw createError('Invalid or expired verification token', 400)
      }

      // Update user to verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        }
      })

      res.json({
        message: 'Email verified successfully! You can now sign in.',
        success: true
      })
    } catch (error) {
      next(error)
    }
  }
)

// Resend verification email
router.post('/resend-verification',
  [
    body('email').isEmail().normalizeEmail()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { email } = req.body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({
          message: 'If an account exists with this email, a verification link has been sent.'
        })
      }

      if (user.emailVerified) {
        return res.json({
          message: 'Email is already verified. You can sign in.'
        })
      }

      // Generate new verification token
      const verificationToken = uuidv4()
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Update user with new token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          verificationTokenExpiry
        }
      })

      // Send verification email
      await sendVerificationEmail(email, verificationToken, user.name || undefined)

      res.json({
        message: 'Verification email sent! Please check your inbox.'
      })
    } catch (error) {
      next(error)
    }
  }
)

// Login (with email verification check)
router.post('/signin',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { email, password } = req.body

      // Find user with follower counts
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          _count: {
            select: {
              followers: true,
              following: true
            }
          }
        }
      })

      if (!user) {
        throw createError('Invalid email or password', 401)
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401)
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({
          message: 'Please verify your email before signing in.',
          requiresVerification: true,
          email: user.email
        })
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )

      // Get avatarUrl separately using raw query
      const avatarResult = await prisma.$queryRaw`SELECT "avatarUrl" FROM users WHERE id = ${user.id}` as any
      const avatarUrl = avatarResult[0]?.avatarUrl || null

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl,
          emailVerified: user.emailVerified,
          hasSeenTutorial: user.hasSeenTutorial,
          _count: user._count
        },
        token
      })
    } catch (error) {
      next(error)
    }
  }
)

// Mark tutorial as completed
router.patch('/tutorial-complete',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id

      await prisma.user.update({
        where: { id: userId },
        data: { hasSeenTutorial: true }
      })

      res.json({
        message: 'Tutorial marked as complete',
        hasSeenTutorial: true
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
