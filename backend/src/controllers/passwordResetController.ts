import { Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'
import { AuthRequest } from '../middleware/auth'
import { sendPasswordResetEmail } from '../services/emailService'

const prisma = new PrismaClient()

// Request password reset
export const requestPasswordReset = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body

    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // TODO: Send email with reset link
    // For now, we'll log the token for development
    console.log(`Password reset token for ${email}: ${resetToken}`)
    console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`)
    
    // Send email with reset link
    try {
      await sendPasswordResetEmail(user.email, resetToken)
      console.log('Password reset email sent successfully')
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Continue execution - don't fail the request if email fails
    }

    res.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.',
      // Remove this in production - only for demo
      resetToken,
      resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    })
  } catch (error) {
    console.error('Request password reset error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Reset password with token
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body

    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    // Find user by reset token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() }
      }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    console.log(`Resetting password for user: ${user.email}`)

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    res.json({ message: 'Password has been reset successfully. You can now sign in with your new password.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Validation rules
export const requestPasswordResetValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
]

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character')
]
