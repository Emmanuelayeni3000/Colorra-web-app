import express, { Request, Response, NextFunction } from 'express'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { createError } from '../middleware/errorHandler'

const router = express.Router()
const prisma = new PrismaClient()

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

interface GoogleTokenPayload {
    email: string
    name?: string
    picture?: string
    email_verified?: boolean
    sub: string // Google user ID
}

// Google Sign-In endpoint
router.post('/google',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { credential } = req.body

            if (!credential) {
                throw createError('Google credential is required', 400)
            }

            // Verify the Google ID token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            })

            const payload = ticket.getPayload() as GoogleTokenPayload

            if (!payload || !payload.email) {
                throw createError('Invalid Google token', 401)
            }

            if (!payload.email_verified) {
                throw createError('Google email not verified', 401)
            }

            // Check if user exists
            let user = await prisma.user.findUnique({
                where: { email: payload.email },
                include: {
                    _count: {
                        select: {
                            followers: true,
                            following: true
                        }
                    }
                }
            })

            if (user) {
                // Existing user - update their Google info if missing
                if (!user.avatarUrl && payload.picture) {
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { avatarUrl: payload.picture },
                        include: {
                            _count: {
                                select: {
                                    followers: true,
                                    following: true
                                }
                            }
                        }
                    })
                }
            } else {
                // New user - create account
                user = await prisma.user.create({
                    data: {
                        email: payload.email,
                        name: payload.name || null,
                        avatarUrl: payload.picture || null,
                        password: '', // No password for Google users
                        emailVerified: true, // Google users are already verified
                        googleId: payload.sub,
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
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            )

            res.json({
                message: 'Google sign-in successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatarUrl: user.avatarUrl,
                    emailVerified: user.emailVerified,
                    _count: user._count
                },
                token
            })
        } catch (error) {
            console.error('Google auth error:', error)
            if (error instanceof Error && error.message === 'Invalid Google token') {
                return res.status(401).json({ message: 'Invalid Google token' })
            }
            next(error)
        }
    }
)

export default router
