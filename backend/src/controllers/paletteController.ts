import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPalettesByCategory = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    next(error);
  }
};
