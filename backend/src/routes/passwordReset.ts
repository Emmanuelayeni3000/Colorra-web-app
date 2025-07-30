import express from 'express'
import { requestPasswordReset, resetPassword, requestPasswordResetValidation, resetPasswordValidation } from '../controllers/passwordResetController'

const router = express.Router()

// Request password reset
router.post('/request', requestPasswordResetValidation, requestPasswordReset)

// Reset password with token
router.post('/reset', resetPasswordValidation, resetPassword)

export default router
