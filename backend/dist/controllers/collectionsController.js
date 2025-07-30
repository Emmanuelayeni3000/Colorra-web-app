"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPaletteToCollectionValidation = exports.createCollectionValidation = exports.deleteCollection = exports.removePaletteFromCollection = exports.addPaletteToCollection = exports.getUserCollections = exports.createCollection = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// Create a new collection
const createCollection = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { name, description } = req.body;
        // Check validation results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const collection = await prisma.collection.create({
            data: {
                name,
                description,
                userId: req.user.id
            },
            include: {
                palettes: {
                    include: {
                        palette: {
                            select: {
                                id: true,
                                name: true,
                                colors: true,
                                description: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Collection created successfully',
            data: collection
        });
    }
    catch (error) {
        console.error('Create collection error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCollection = createCollection;
// Get user's collections
const getUserCollections = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const collections = await prisma.collection.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                palettes: {
                    include: {
                        palette: {
                            select: {
                                id: true,
                                name: true,
                                colors: true,
                                description: true,
                                createdAt: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            skip,
            take: limit
        });
        const totalCount = await prisma.collection.count({
            where: {
                userId: req.user.id
            }
        });
        const totalPages = Math.ceil(totalCount / limit);
        res.json({
            message: 'Collections retrieved successfully',
            data: {
                collections,
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
        console.error('Get user collections error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserCollections = getUserCollections;
// Add palette to collection
const addPaletteToCollection = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { collectionId, paletteId } = req.body;
        // Check validation results
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        // Verify collection belongs to user
        const collection = await prisma.collection.findFirst({
            where: {
                id: collectionId,
                userId: req.user.id
            }
        });
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        // Verify palette exists and belongs to user
        const palette = await prisma.palette.findFirst({
            where: {
                id: paletteId,
                userId: req.user.id
            }
        });
        if (!palette) {
            return res.status(404).json({ message: 'Palette not found' });
        }
        // Check if palette already in collection
        const existingEntry = await prisma.collectionPalette.findFirst({
            where: {
                collectionId,
                paletteId
            }
        });
        if (existingEntry) {
            return res.status(400).json({ message: 'Palette already in collection' });
        }
        // Add palette to collection
        await prisma.collectionPalette.create({
            data: {
                collectionId,
                paletteId
            }
        });
        res.json({ message: 'Palette added to collection successfully' });
    }
    catch (error) {
        console.error('Add palette to collection error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.addPaletteToCollection = addPaletteToCollection;
// Remove palette from collection
const removePaletteFromCollection = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { collectionId, paletteId } = req.params;
        // Verify collection belongs to user
        const collection = await prisma.collection.findFirst({
            where: {
                id: collectionId,
                userId: req.user.id
            }
        });
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        // Remove palette from collection
        const deleted = await prisma.collectionPalette.deleteMany({
            where: {
                collectionId,
                paletteId
            }
        });
        if (deleted.count === 0) {
            return res.status(404).json({ message: 'Palette not found in collection' });
        }
        res.json({ message: 'Palette removed from collection successfully' });
    }
    catch (error) {
        console.error('Remove palette from collection error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.removePaletteFromCollection = removePaletteFromCollection;
// Delete collection
const deleteCollection = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { collectionId } = req.params;
        // Verify collection belongs to user
        const collection = await prisma.collection.findFirst({
            where: {
                id: collectionId,
                userId: req.user.id
            }
        });
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        // Delete collection (cascade will delete collection_palettes)
        await prisma.collection.delete({
            where: { id: collectionId }
        });
        res.json({ message: 'Collection deleted successfully' });
    }
    catch (error) {
        console.error('Delete collection error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteCollection = deleteCollection;
// Validation rules
exports.createCollectionValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Collection name must be between 1 and 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters')
];
exports.addPaletteToCollectionValidation = [
    (0, express_validator_1.body)('collectionId')
        .notEmpty()
        .withMessage('Collection ID is required'),
    (0, express_validator_1.body)('paletteId')
        .notEmpty()
        .withMessage('Palette ID is required')
];
//# sourceMappingURL=collectionsController.js.map