import { Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'
import { AuthRequest } from '../middleware/auth'

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

    // In a real application, you would:
    // 1. Store the reset token in the database
    // 2. Send an email with the reset link
    // For demo purposes, we'll just return the token
    
    // TODO: Store reset token in database (you'd need to add fields to User model)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     resetToken,
    //     resetTokenExpiry
    //   }
    // })

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken)

    console.log(`Password reset token for ${email}: ${resetToken}`)
    
    res.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.',
      // Remove this in production - only for demo
      resetToken 
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

    // In a real application, you would find the user by the reset token
    // For demo purposes, we'll skip token validation
    
    // TODO: Find user by reset token and check expiry
    // const user = await prisma.user.findFirst({
    //   where: {
    //     resetToken: token,
    //     resetTokenExpiry: { gte: new Date() }
    //   }
    // })

    // if (!user) {
    //   return res.status(400).json({ message: 'Invalid or expired reset token' })
    // }

    // For demo, we'll just update any user's password (this is NOT secure)
    // In production, you must validate the token properly
    console.log(`Resetting password with token: ${token}`)

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // TODO: Update user password and clear reset token
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpiry: null
    //   }
    // })

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
