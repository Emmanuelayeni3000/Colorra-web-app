"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharePaletteValidation = exports.removePaletteShare = exports.getMySharedPalettes = exports.getSharedPalettes = exports.sharePalette = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// Share a palette with another user
const sharePalette = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { paletteId, userEmail, message } = req.body;
        // Check validation results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        // Check if palette exists and belongs to user
        const palette = await prisma.palette.findFirst({
            where: {
                id: paletteId,
                userId: req.user.id
            }
        });
        if (!palette) {
            return res.status(404).json({ message: 'Palette not found or access denied' });
        }
        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { email: userEmail }
        });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if already shared with this user
        const existingShare = await prisma.paletteShare.findFirst({
            where: {
                paletteId,
                sharedWithId: targetUser.id
            }
        });
        if (existingShare) {
            return res.status(400).json({ message: 'Palette already shared with this user' });
        }
        // Create share record
        const share = await prisma.paletteShare.create({
            data: {
                paletteId,
                sharedById: req.user.id,
                sharedWithId: targetUser.id,
                message: message || null
            },
            include: {
                palette: {
                    select: {
                        name: true,
                        colors: true
                    }
                },
                sharedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                sharedWith: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Palette shared successfully',
            data: share
        });
    }
    catch (error) {
        console.error('Share palette error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.sharePalette = sharePalette;
// Get palettes shared with the current user
const getSharedPalettes = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sharedPalettes = await prisma.paletteShare.findMany({
            where: {
                sharedWithId: req.user.id
            },
            include: {
                palette: {
                    select: {
                        id: true,
                        name: true,
                        colors: true,
                        description: true,
                        createdAt: true
                    }
                },
                sharedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalCount = await prisma.paletteShare.count({
            where: {
                sharedWithId: req.user.id
            }
        });
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            message: 'Shared palettes retrieved successfully',
            data: {
                palettes: sharedPalettes,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Get shared palettes error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSharedPalettes = getSharedPalettes;
// Get palettes shared by the current user
const getMySharedPalettes = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const mySharedPalettes = await prisma.paletteShare.findMany({
            where: {
                sharedById: req.user.id
            },
            include: {
                palette: {
                    select: {
                        id: true,
                        name: true,
                        colors: true,
                        description: true,
                        createdAt: true
                    }
                },
                sharedWith: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalCount = await prisma.paletteShare.count({
            where: {
                sharedById: req.user.id
            }
        });
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            message: 'My shared palettes retrieved successfully',
            data: {
                palettes: mySharedPalettes,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Get my shared palettes error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMySharedPalettes = getMySharedPalettes;
// Remove palette share
const removePaletteShare = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { shareId } = req.params;
        // Find the share record
        const share = await prisma.paletteShare.findUnique({
            where: { id: shareId }
        });
        if (!share) {
            return res.status(404).json({ message: 'Share not found' });
        }
        // Check if user is the owner of the palette or the recipient
        if (share.sharedById !== req.user.id && share.sharedWithId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Delete the share
        await prisma.paletteShare.delete({
            where: { id: shareId }
        });
        res.json({ message: 'Palette share removed successfully' });
    }
    catch (error) {
        console.error('Remove palette share error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.removePaletteShare = removePaletteShare;
// Validation rules
exports.sharePaletteValidation = [
    (0, express_validator_1.body)('paletteId')
        .notEmpty()
        .withMessage('Palette ID is required'),
    (0, express_validator_1.body)('userEmail')
        .isEmail()
        .withMessage('Valid email address is required')
        .normalizeEmail(),
    (0, express_validator_1.body)('message')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Message must be less than 500 characters')
];
//# sourceMappingURL=sharingController.js.map