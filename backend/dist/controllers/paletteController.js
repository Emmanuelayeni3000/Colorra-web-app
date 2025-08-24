"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPalettesByCategory = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getPalettesByCategory = async (req, res, next) => {
    try {
        const { categoryName } = req.params;
        if (!categoryName) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        const palettes = await prisma.palette.findMany({
            where: {
                category: { name: categoryName }
            },
        });
        if (palettes.length === 0) {
            return res.status(404).json({ message: `No palettes found for category: ${categoryName}` });
        }
        res.status(200).json(palettes);
    }
    catch (error) {
        next(error);
    }
};
exports.getPalettesByCategory = getPalettesByCategory;
//# sourceMappingURL=paletteController.js.map