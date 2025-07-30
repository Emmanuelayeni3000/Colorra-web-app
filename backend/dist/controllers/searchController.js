"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularColors = exports.getColorSuggestions = exports.searchPalettes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const searchPalettes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { query, colors, dateFrom, dateTo, favorites, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;
        // Build where clause
        const whereClause = {
            userId,
            AND: []
        };
        // Text search in name and description
        if (query && typeof query === 'string') {
            whereClause.AND.push({
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            });
        }
        // Filter by favorites
        if (favorites === 'true') {
            whereClause.AND.push({ isFavorite: true });
        }
        // Date range filter
        if (dateFrom || dateTo) {
            const dateFilter = {};
            if (dateFrom)
                dateFilter.gte = new Date(dateFrom);
            if (dateTo)
                dateFilter.lte = new Date(dateTo);
            whereClause.AND.push({ createdAt: dateFilter });
        }
        // Color filter - search for palettes containing specific colors
        if (colors && typeof colors === 'string') {
            const colorArray = colors.split(',').map(c => c.trim());
            const colorFilters = colorArray.map(color => ({
                colors: { contains: color }
            }));
            whereClause.AND.push({ OR: colorFilters });
        }
        // If no AND conditions, remove the empty array
        if (whereClause.AND.length === 0) {
            delete whereClause.AND;
        }
        // Calculate pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        // Build order by clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        // Execute search with pagination
        const [palettes, total] = await Promise.all([
            prisma.palette.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: limitNum,
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
            }),
            prisma.palette.count({ where: whereClause })
        ]);
        // Parse colors JSON string back to array
        const parsedPalettes = palettes.map(palette => ({
            ...palette,
            colors: JSON.parse(palette.colors)
        }));
        // Calculate pagination info
        const totalPages = Math.ceil(total / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        res.json({
            palettes: parsedPalettes,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount: total,
                hasNextPage,
                hasPrevPage,
                limit: limitNum
            }
        });
    }
    catch (error) {
        console.error('Search palettes error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.searchPalettes = searchPalettes;
// Get color suggestions based on existing palettes
const getColorSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.json({ colors: [] });
        }
        // Get all palettes for the user
        const palettes = await prisma.palette.findMany({
            where: { userId },
            select: { colors: true }
        });
        // Extract all unique colors
        const allColors = new Set();
        palettes.forEach(palette => {
            const colors = JSON.parse(palette.colors);
            colors.forEach(color => allColors.add(color.toLowerCase()));
        });
        // Filter colors that match the query
        const matchingColors = Array.from(allColors)
            .filter(color => color.includes(query.toLowerCase()))
            .slice(0, 10); // Limit to 10 suggestions
        res.json({ colors: matchingColors });
    }
    catch (error) {
        console.error('Get color suggestions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getColorSuggestions = getColorSuggestions;
// Get popular colors across all user palettes
const getPopularColors = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get all palettes for the user
        const palettes = await prisma.palette.findMany({
            where: { userId },
            select: { colors: true }
        });
        // Count color frequency
        const colorCounts = new Map();
        palettes.forEach(palette => {
            const colors = JSON.parse(palette.colors);
            colors.forEach(color => {
                const lowerColor = color.toLowerCase();
                colorCounts.set(lowerColor, (colorCounts.get(lowerColor) || 0) + 1);
            });
        });
        // Sort by frequency and get top 20
        const popularColors = Array.from(colorCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .map(([color, count]) => ({ color, count }));
        res.json({ colors: popularColors });
    }
    catch (error) {
        console.error('Get popular colors error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPopularColors = getPopularColors;
//# sourceMappingURL=searchController.js.map