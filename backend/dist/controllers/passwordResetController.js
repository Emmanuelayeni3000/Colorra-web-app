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
const emailService_1 = require("../services/emailService");
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
        // Store reset token in database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        // TODO: Send email with reset link
        // For now, we'll log the token for development
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
        // Send email with reset link
        try {
            await (0, emailService_1.sendPasswordResetEmail)(user.email, resetToken);
            console.log('Password reset email sent successfully');
        }
        catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Continue execution - don't fail the request if email fails
        }
        res.json({
            message: 'If an account with that email exists, we have sent a password reset link.',
            // Remove this in production - only for demo
            resetToken,
            resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
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
        // Find user by reset token and check expiry
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() }
            }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        console.log(`Resetting password for user: ${user.email}`);
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
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