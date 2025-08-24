"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.getSharedPalettes = exports.sharePalette = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const sharePalette = async (req, res) => {
    const { paletteId } = req.params;
    const { sharedWithId } = req.body;
    const sharedById = req.user?.id;
    if (!sharedById) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        // Check if the palette exists and belongs to the user sharing it
        const palette = await prisma.palette.findUnique({
            where: { id: paletteId },
        });
        if (!palette) {
            return res.status(404).json({ message: 'Palette not found' });
        }
        if (palette.userId !== sharedById) {
            return res.status(403).json({ message: 'You can only share your own palettes' });
        }
        // Check if the palette is already shared with this user
        const existingShare = await prisma.sharedPalette.findFirst({
            where: {
                paletteId: paletteId,
                sharedById: sharedById,
                sharedWithId: sharedWithId,
            },
        });
        if (existingShare) {
            return res.status(409).json({ message: 'Palette already shared with this user' });
        }
        const sharedPalette = await prisma.sharedPalette.create({
            data: {
                paletteId,
                sharedById,
                sharedWithId,
            },
        });
        res.status(201).json(sharedPalette);
    }
    catch (error) {
        console.error('Error sharing palette:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.sharePalette = sharePalette;
const getSharedPalettes = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const sharedPalettes = await prisma.sharedPalette.findMany({
            where: {
                sharedWithId: userId,
            },
            include: {
                palette: true, // Include the full palette details
                sharedBy: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
        res.status(200).json(sharedPalettes);
    }
    catch (error) {
        console.error('Error fetching shared palettes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSharedPalettes = getSharedPalettes;
const searchUsers = async (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query.trim() } },
                    { email: { contains: query.trim() } },
                ],
            },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
            },
            take: 10, // Limit results
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=sharingController.js.map