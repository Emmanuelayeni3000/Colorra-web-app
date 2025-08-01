import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'
import { AuthRequest } from '../middleware/auth'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            palettes: true
          }
        }
      }
    }) as any

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get avatarUrl separately using raw query
    const avatarResult = await prisma.$queryRaw`SELECT avatarUrl FROM users WHERE id = ${userId}` as any
    const avatarUrl = avatarResult[0]?.avatarUrl || null

    res.json({ ...user, avatarUrl })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { name, email } = req.body

    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    }) as any

    // Get avatarUrl separately using raw query
    const avatarResult = await prisma.$queryRaw`SELECT avatarUrl FROM users WHERE id = ${userId}` as any
    const avatarUrl = avatarResult[0]?.avatarUrl || null

    res.json({ ...updatedUser, avatarUrl })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Change password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { currentPassword, newPassword } = req.body

    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Validation rules
export const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
]

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
]

// Upload avatar
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    console.log('Upload avatar request for user:', userId)
    
    if (!req.file) {
      console.error('No file uploaded in request')
      return res.status(400).json({ message: 'No file uploaded' })
    }

    console.log('Uploaded file:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    })

    // File path relative to the uploads directory
    const avatarUrl = `/uploads/${req.file.filename}`

    // Update user with new avatar URL using raw query
    await prisma.$executeRaw`UPDATE users SET avatarUrl = ${avatarUrl} WHERE id = ${userId}`
    console.log('Updated user avatar URL in database:', avatarUrl)

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    }) as any

    console.log('Returning success response')
    res.json({
      message: 'Avatar uploaded successfully',
      user: { ...updatedUser, avatarUrl },
      avatarUrl
    })
  } catch (error) {
    console.error('Upload avatar error:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
