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
const activityService_1 = require("../services/activityService");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all palettes for authenticated user
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { search } = req.query;
        const userId = req.user.id;
        // console.log(`[GET /api/palettes] userId: ${userId}, favorites: ${favorites}, search: ${search}`)
        const whereClause = { userId };
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                // Field 'description' removed from schema
            ];
        }
        const palettes = await prisma.palette.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                colors: true,
                isPublic: true,
                isFavorite: true,
                createdAt: true,
                updatedAt: true
            }
        });
        // Parse colors JSON string back to array (add explicit type to satisfy TS)
        const parsedPalettes = palettes.map((palette) => ({
            ...palette,
            colors: JSON.parse(palette.colors)
        }));
        res.json(parsedPalettes);
    }
    catch (error) {
        next(error);
    }
});
// Get all public palettes (optionally showing if bookmarked by current user)
router.get('/public', async (req, res, next) => {
    try {
        const userId = req.user?.id; // User ID is optional now
        const where = { isPublic: true };
        const palettes = await prisma.palette.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, avatarUrl: true }
                },
                bookmarkedPalettes: userId ? { where: { userId }, select: { id: true } } : false
            }
        });
        const parsedPalettes = palettes.map((p) => ({
            ...p,
            colors: JSON.parse(p.colors),
            isBookmarked: userId ? (p.bookmarkedPalettes && p.bookmarkedPalettes.length > 0) : false,
            bookmarkedPalettes: undefined
        }));
        res.json(parsedPalettes);
    }
    catch (error) {
        next(error);
    }
});
// Get Palette of the Day
router.get('/daily', async (req, res, next) => {
    console.time('GET /palettes/daily');
    try {
        console.log('[daily] Incoming request');
        // 1. Try to fetch an already designated palette of the day
        let paletteOfTheDay = await prisma.palette.findFirst({
            where: { isPaletteOfTheDay: true, isPublic: true },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        console.log('[daily] Existing paletteOfTheDay found:', !!paletteOfTheDay, paletteOfTheDay?.id);
        let newlySelected = false;
        // 2. If none set, attempt to auto-select one from public palettes using smart algorithm
        if (!paletteOfTheDay) {
            console.log('[daily] No existing paletteOfTheDay. Selecting a new one...');
            // Get palettes with engagement metrics
            const candidatePalettes = await prisma.palette.findMany({
                where: { isPublic: true },
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true } },
                    bookmarkedPalettes: { select: { id: true } }
                },
                orderBy: [
                    { createdAt: 'desc' }
                ],
                take: 100, // Get more candidates for better selection
            });
            console.log('[daily] Candidate palettes fetched:', candidatePalettes.length);
            if (candidatePalettes.length === 0) {
                console.log('[daily] No candidates available');
                return res.status(404).json({ message: 'No public palettes available yet' });
            }
            // Score palettes based on engagement and recency
            const scoredPalettes = candidatePalettes.map(palette => {
                const bookmarkCount = palette.bookmarkedPalettes.length;
                const daysSinceCreated = Math.floor((Date.now() - new Date(palette.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                const recencyBonus = Math.max(0, 30 - daysSinceCreated) / 30; // Higher score for newer palettes
                // Weighted scoring: bookmarks (70%) + recency (30%)
                const score = (bookmarkCount * 0.7) + (recencyBonus * 0.3);
                return {
                    ...palette,
                    score
                };
            });
            // Sort by score and add some randomness to top candidates
            scoredPalettes.sort((a, b) => b.score - a.score);
            console.log('[daily] Top 3 scores:', scoredPalettes.slice(0, 3).map(p => ({ id: p.id, score: p.score })));
            // Select from top 10 or top 25% (whichever is smaller) with weighted randomness
            const topCandidates = scoredPalettes.slice(0, Math.min(10, Math.ceil(scoredPalettes.length * 0.25)));
            console.log('[daily] topCandidates length:', topCandidates.length);
            // Weighted random selection favoring higher scores
            const totalWeight = topCandidates.reduce((sum, p) => sum + (p.score + 1), 0);
            let random = Math.random() * totalWeight;
            let selectedPalette = topCandidates[0];
            for (const palette of topCandidates) {
                random -= (palette.score + 1);
                if (random <= 0) {
                    selectedPalette = palette;
                    break;
                }
            }
            // Clear previous palette of the day and set new one
            console.log('[daily] Clearing previous paletteOfTheDay flags');
            await prisma.palette.updateMany({
                where: { isPaletteOfTheDay: true },
                data: { isPaletteOfTheDay: false }
            });
            console.log('[daily] Setting new paletteOfTheDay:', selectedPalette.id);
            await prisma.palette.update({
                where: { id: selectedPalette.id },
                data: { isPaletteOfTheDay: true },
            });
            paletteOfTheDay = selectedPalette;
            newlySelected = true;
        }
        console.log('[daily] Returning paletteOfTheDay response. Newly selected:', newlySelected, 'id:', paletteOfTheDay?.id);
        res.json({
            ...paletteOfTheDay,
            colors: JSON.parse(paletteOfTheDay.colors),
            autoSelected: newlySelected,
        });
    }
    catch (error) {
        console.error('[daily] Error:', error);
        next(error);
    }
    finally {
        console.timeEnd('GET /palettes/daily');
    }
});
// Get single public palette by ID (no auth required)
router.get('/public/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id; // Optional user ID for bookmark status
        const palette = await prisma.palette.findFirst({
            where: {
                id,
                isPublic: true
            },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
                bookmarkedPalettes: userId ? { where: { userId }, select: { id: true } } : false
            },
        });
        if (!palette) {
            throw (0, errorHandler_1.createError)('Public palette not found', 404);
        }
        res.json({
            ...palette,
            colors: JSON.parse(palette.colors),
            isBookmarked: userId ? (palette.bookmarkedPalettes && palette.bookmarkedPalettes.length > 0) : false,
            bookmarkedPalettes: undefined
        });
    }
    catch (error) {
        next(error);
    }
});
// Get public palettes by user ID (no auth required)
router.get('/public/user/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id; // Optional user ID for bookmark status
        const palettes = await prisma.palette.findMany({
            where: {
                userId,
                isPublic: true
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
                bookmarkedPalettes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false
            },
        });
        const parsedPalettes = palettes.map((p) => ({
            ...p,
            colors: JSON.parse(p.colors),
            isBookmarked: currentUserId ? (p.bookmarkedPalettes && p.bookmarkedPalettes.length > 0) : false,
            bookmarkedPalettes: undefined
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
    (0, express_validator_1.body)('colors').isArray({ min: 1, max: 10 }),
    (0, express_validator_1.body)('colors.*').matches(/^#[0-9A-Fa-f]{6}$/),
    // Removed description, imageUrl, category validations (fields not in schema)
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { name, colors } = req.body;
        const userId = req.user.id;
        const palette = await prisma.palette.create({
            data: {
                name,
                colors: JSON.stringify(colors),
                isPublic: false,
                userId
            }
        });
        // Create activity for palette creation
        await (0, activityService_1.createActivity)("PALETTE_CREATED", userId, { paletteId: palette.id });
        res.status(201).json({
            palette: {
                ...palette,
                colors: JSON.parse(palette.colors)
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Update palette
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('colors').optional().isArray({ min: 1, max: 10 }),
    (0, express_validator_1.body)('colors.*').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    // removed imageUrl & isFavorite
    (0, express_validator_1.body)('isPublic').optional().isBoolean(),
    (0, express_validator_1.body)('isFavorite').optional().isBoolean(),
    // removed category
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
        const { name, colors, isPublic, isFavorite } = req.body;
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
        if (colors !== undefined)
            updateData.colors = JSON.stringify(colors);
        if (isPublic !== undefined)
            updateData.isPublic = isPublic;
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
// Toggle public visibility (explicit route so UI can call directly)
router.patch('/:id/public', auth_1.authenticateToken, [(0, express_validator_1.body)('isPublic').isBoolean()], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }
        const { id } = req.params;
        const { isPublic } = req.body;
        const userId = req.user.id;
        const existingPalette = await prisma.palette.findFirst({ where: { id, userId } });
        if (!existingPalette) {
            throw (0, errorHandler_1.createError)('Palette not found', 404);
        }
        const updated = await prisma.palette.update({ where: { id }, data: { isPublic } });
        res.json({ ...updated, colors: JSON.parse(updated.colors) });
    }
    catch (error) {
        next(error);
    }
});
// Bookmark a public palette
router.post('/:id/bookmark', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if palette exists and is public
        const palette = await prisma.palette.findUnique({
            where: { id },
        });
        if (!palette || !palette.isPublic) {
            throw (0, errorHandler_1.createError)('Public palette not found', 404);
        }
        // Check if already bookmarked
        const existingBookmark = await prisma.bookmarkedPalette.findUnique({
            where: {
                userId_paletteId: {
                    userId,
                    paletteId: id,
                },
            },
        });
        if (existingBookmark) {
            return res.status(200).json({ message: 'Palette already bookmarked' });
        }
        const bookmark = await prisma.bookmarkedPalette.create({
            data: {
                userId,
                paletteId: id,
            },
        });
        // Create activity for palette bookmark
        await (0, activityService_1.createActivity)("PALETTE_BOOKMARKED", userId, { paletteId: id });
        res.status(201).json(bookmark);
    }
    catch (error) {
        next(error);
    }
});
// Unbookmark a public palette
router.delete('/:id/bookmark', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const bookmark = await prisma.bookmarkedPalette.delete({
            where: {
                userId_paletteId: {
                    userId,
                    paletteId: id,
                },
            },
        });
        res.status(200).json({ message: 'Palette unbookmarked successfully' });
    }
    catch (error) {
        next(error);
    }
});
// Get all bookmarked palettes for the authenticated user
router.get('/me/bookmarked-palettes', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const bookmarkedPalettes = await prisma.bookmarkedPalette.findMany({
            where: { userId },
            include: {
                palette: {
                    include: {
                        user: {
                            select: {
                                id: true, // Added missing id field
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        const parsedPalettes = bookmarkedPalettes.map((bp) => ({
            ...bp.palette,
            colors: JSON.parse(bp.palette.colors),
            isBookmarked: true, // Indicate that this palette is bookmarked by the current user
        }));
        res.json(parsedPalettes);
    }
    catch (error) {
        next(error);
    }
});
// Favorite functionality removed (isFavorite column no longer exists)
// Toggle favorite status (owner only)
router.patch('/:id/favorite', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const palette = await prisma.palette.findFirst({ where: { id, userId } });
        if (!palette) {
            throw (0, errorHandler_1.createError)('Palette not found', 404);
        }
        const updated = await prisma.palette.update({
            where: { id },
            data: { isFavorite: !palette.isFavorite }
        });
        res.json({
            ...updated,
            colors: JSON.parse(updated.colors)
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
// Remix a public palette
router.post('/:id/remix', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Find the original palette
        const originalPalette = await prisma.palette.findUnique({
            where: { id },
        });
        if (!originalPalette || !originalPalette.isPublic) {
            throw (0, errorHandler_1.createError)('Public palette not found or not remixable', 404);
        }
        // Create a new palette for the current user, copying details
        const newPalette = await prisma.palette.create({
            data: {
                name: `Remix of ${originalPalette.name}`,
                colors: originalPalette.colors,
                isPublic: false,
                userId: userId,
            },
        });
        // Create activity for palette remix
        await (0, activityService_1.createActivity)("PALETTE_REMIXED", userId, { paletteId: newPalette.id });
        res.status(201).json({
            palette: {
                ...newPalette,
                colors: JSON.parse(newPalette.colors),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=palettes.js.map