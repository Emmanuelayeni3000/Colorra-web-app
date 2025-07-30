"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidation = exports.requestPasswordResetValidation = exports.resetPassword = exports.requestPasswordReset = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        // Check validation results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });
        // Always return success message for security (don't reveal if email exists)
        if (!user) {
            return res.json({
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
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
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.json({
            message: 'If an account with that email exists, we have sent a password reset link.',
            // Remove this in production - only for demo
            resetToken
        });
    }
    catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requestPasswordReset = requestPasswordReset;
// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        // Check validation results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
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
        console.log(`Resetting password with token: ${token}`);
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // TODO: Update user password and clear reset token
        // await prisma.user.update({
        //   where: { id: user.id },
        //   data: {
        //     password: hashedPassword,
        //     resetToken: null,
        //     resetTokenExpiry: null
        //   }
        // })
        res.json({ message: 'Password has been reset successfully. You can now sign in with your new password.' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
// Validation rules
exports.requestPasswordResetValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
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
];
//# sourceMappingURL=passwordResetController.js.map