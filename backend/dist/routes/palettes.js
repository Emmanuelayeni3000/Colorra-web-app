"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all palettes for authenticated user
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { favorites } = req.query;
        const userId = req.user.id;
        const whereClause = { userId };
        if (favorites === 'true') {
            whereClause.isFavorite = true;
        }
        const palettes = await prisma.palette.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                description: true,
                colors: true,
                imageUrl: true,
                isFavorite: true,
                createdAt: true,
                updatedAt: true
            }
        });
        // Parse colors JSON string back to array
        const parsedPalettes = palettes.map(palette => ({
            ...palette,
            colors: JSON.parse(palette.colors)
        }));
        res.json(parsedPalettes);
    }
    catch (error) {
        next(error);
    }
});
// Get single palette
router.get('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const palette = await prisma.palette.findFirst({
            where: { id, userId }
        });
        if (!palette) {
            throw (0, errorHandler_1.createError)('Palette not found', 404);
        }
        res.json({
            ...palette,
            colors: JSON.parse(palette.colors)
        });
    }
    catch (error) {
        next(error);
    }
});
// Create new palette
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('colors').isArray({ min: 1, max: 10 }),
    (0, express_validator_1.body)('colors.*').matches(/^#[0-9A-Fa-f]{6}$/),
    (0, express_validator_1.body)('imageUrl').optional().isURL()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { name, description, colors, imageUrl } = req.body;
        const userId = req.user.id;
        const palette = await prisma.palette.create({
            data: {
                name,
                description: description || null,
                colors: JSON.stringify(colors),
                imageUrl: imageUrl || null,
                userId
            }
        });
        res.status(201).json({
            ...palette,
            colors: JSON.parse(palette.colors)
        });
    }
    catch (error) {
        next(error);
    }
});
// Update palette
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('colors').optional().isArray({ min: 1, max: 10 }),
    (0, express_validator_1.body)('colors.*').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('isFavorite').optional().isBoolean()
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const { name, description, colors, imageUrl, isFavorite } = req.body;
        const userId = req.user.id;
        // Check if palette exists and belongs to user
        const existingPalette = await prisma.palette.findFirst({
            where: { id, userId }
        });
        if (!existingPalette) {
            throw (0, errorHandler_1.createError)('Palette not found', 404);
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (colors !== undefined)
            updateData.colors = JSON.stringify(colors);
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        if (isFavorite !== undefined)
            updateData.isFavorite = isFavorite;
        const palette = await prisma.palette.update({
            where: { id },
            data: updateData
        });
        res.json({
            ...palette,
            colors: JSON.parse(palette.colors)
        });
    }
    catch (error) {
        next(error);
    }
});
// Toggle favorite status
router.patch('/:id/favorite', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingPalette = await prisma.palette.findFirst({
            where: { id, userId }
        });
        if (!existingPalette) {
            throw (0, errorHandler_1.createError)('Palette not found', 404);
        }
        const palette = await prisma.palette.update({
            where: { id },
            data: { isFavorite: !existingPalette.isFavorite }
        });
        res.json({
            ...palette,
            colors: JSON.parse(palette.colors)
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete palette
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingPalette = await prisma.palette.findFirst({
            where: { id, userId }
        });
        if (!existingPalette) {
            throw (0, errorHandler_1.createError)('Palette not found', 404);
        }
        await prisma.palette.delete({
            where: { id }
        });
        res.json({ message: 'Palette deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=palettes.js.map