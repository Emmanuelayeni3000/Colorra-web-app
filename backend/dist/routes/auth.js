"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const emailService_1 = require("../services/emailService");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Register (with email verification)
router.post('/signup', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }).optional()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password, name } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw (0, errorHandler_1.createError)('User already exists with this email', 409);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Generate verification token
        const verificationToken = (0, uuid_1.v4)();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
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
        });
        // Send verification email
        try {
            await (0, emailService_1.sendVerificationEmail)(email, verificationToken, name);
        }
        catch (emailError) {
            console.error('Failed to send verification email:', emailError);
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
        });
    }
    catch (error) {
        next(error);
    }
});
// Verify email with token
router.get('/verify-email', async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            throw (0, errorHandler_1.createError)('Verification token is required', 400);
        }
        // Find user with this token
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Invalid or expired verification token', 400);
        }
        // Update user to verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null
            }
        });
        res.json({
            message: 'Email verified successfully! You can now sign in.',
            success: true
        });
    }
    catch (error) {
        next(error);
    }
});
// Resend verification email
router.post('/resend-verification', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                message: 'If an account exists with this email, a verification link has been sent.'
            });
        }
        if (user.emailVerified) {
            return res.json({
                message: 'Email is already verified. You can sign in.'
            });
        }
        // Generate new verification token
        const verificationToken = (0, uuid_1.v4)();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Update user with new token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken,
                verificationTokenExpiry
            }
        });
        // Send verification email
        await (0, emailService_1.sendVerificationEmail)(email, verificationToken, user.name || undefined);
        res.json({
            message: 'Verification email sent! Please check your inbox.'
        });
    }
    catch (error) {
        next(error);
    }
});
// Login (with email verification check)
router.post('/signin', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').exists()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
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
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Invalid email or password', 401);
        }
        // Check password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createError)('Invalid email or password', 401);
        }
        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before signing in.',
                requiresVerification: true,
                email: user.email
            });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // Get avatarUrl separately using raw query
        const avatarResult = await prisma.$queryRaw `SELECT "avatarUrl" FROM users WHERE id = ${user.id}`;
        const avatarUrl = avatarResult[0]?.avatarUrl || null;
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl,
                emailVerified: user.emailVerified,
                _count: user._count
            },
            token
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map