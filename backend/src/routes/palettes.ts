import express, { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { createActivity } from '../services/activityService'

const router = express.Router()
const prisma = new PrismaClient()

// Get all palettes for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query
    const userId = req.user!.id
    // console.log(`[GET /api/palettes] userId: ${userId}, favorites: ${favorites}, search: ${search}`)

    const whereClause: any = { userId }
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        // Field 'description' removed from schema
      ]
    }

    const palettes = await prisma.palette.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } }
      }
    })


    // Parse colors JSON string back to array and include category name
    const parsedPalettes = palettes.map((palette: any) => ({
      ...palette,
      colors: JSON.parse(palette.colors),
      category: palette.category?.name || null,
      categoryId: undefined
    }))

    res.json(parsedPalettes)
  } catch (error) {
    next(error)
  }
});

// Get explore page statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total public palettes count
    const totalPalettes = await prisma.palette.count({
      where: { isPublic: true }
    });

    // Get total bookmarks count (favorites)
    const totalBookmarks = await prisma.bookmarkedPalette.count();

    // For monthly views, we would need a views tracking table
    // For now, we'll estimate based on activity or return a calculated value
    // This could be enhanced later with proper view tracking
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count activities as a proxy for engagement/views
    const monthlyActivity = await prisma.activity.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    res.json({
      totalPalettes,
      totalBookmarks,
      monthlyViews: monthlyActivity // Using activity as proxy for views
    });
  } catch (error) {
    next(error);
  }
});

// Get all public palettes (optionally showing if bookmarked by current user)
router.get('/public', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // User ID is optional now
    const { category } = req.query; // Get category from query params
    const where: any = { isPublic: true };

    // If category is provided, filter by category name
    if (category && typeof category === 'string') {
      where.category = { name: category };
    }

    const palettes = await prisma.palette.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        },
        category: { select: { name: true } }, // Include category info
        bookmarkedPalettes: userId ? { where: { userId }, select: { id: true } } : false,
        _count: {
          select: { bookmarkedPalettes: true }
        }
      }
    });

    const parsedPalettes = palettes.map((p: any) => ({
      ...p,
      colors: JSON.parse(p.colors),
      categoryName: p.category?.name || null,
      isBookmarked: userId ? (p.bookmarkedPalettes && p.bookmarkedPalettes.length > 0) : false,
      bookmarkCount: p._count?.bookmarkedPalettes || 0,
      category: undefined,
      bookmarkedPalettes: undefined,
      _count: undefined
    }));

    res.json(parsedPalettes);
  } catch (error) {
    next(error);
  }
});

// Get Palette of the Day
router.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
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

    // 2. If none set, select the most bookmarked public palette
    if (!paletteOfTheDay) {
      console.log('[daily] No existing paletteOfTheDay. Selecting the most bookmarked palette...');

      // Get the palette with the most bookmarks
      const mostBookmarkedPalette = await prisma.palette.findFirst({
        where: { isPublic: true },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { bookmarkedPalettes: true } }
        },
        orderBy: {
          bookmarkedPalettes: { _count: 'desc' }
        }
      });

      if (!mostBookmarkedPalette) {
        console.log('[daily] No public palettes available');
        return res.status(200).json({
          palette: null,
          autoSelected: false,
          message: 'No public palettes available yet'
        });
      }

      console.log('[daily] Most bookmarked palette:', mostBookmarkedPalette.id, 'with', mostBookmarkedPalette._count.bookmarkedPalettes, 'bookmarks');

      // Clear previous palette of the day and set new one
      console.log('[daily] Clearing previous paletteOfTheDay flags');
      await prisma.palette.updateMany({
        where: { isPaletteOfTheDay: true },
        data: { isPaletteOfTheDay: false }
      });
      console.log('[daily] Setting new paletteOfTheDay:', mostBookmarkedPalette.id);
      await prisma.palette.update({
        where: { id: mostBookmarkedPalette.id },
        data: { isPaletteOfTheDay: true },
      });

      paletteOfTheDay = mostBookmarkedPalette;
      newlySelected = true;
    }

    console.log('[daily] Returning paletteOfTheDay response. Newly selected:', newlySelected, 'id:', paletteOfTheDay?.id);
    // Wrap response with { palette, autoSelected } so absence case can return { palette: null }
    res.json({
      palette: {
        ...paletteOfTheDay,
        colors: JSON.parse(paletteOfTheDay!.colors)
      },
      autoSelected: newlySelected
    });
  } catch (error) {
    console.error('[daily] Error:', error);
    next(error);
  } finally {
    console.timeEnd('GET /palettes/daily');
  }
});

// Get single public palette by ID (no auth required)
router.get('/public/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      throw createError('Public palette not found', 404);
    }

    res.json({
      ...palette,
      colors: JSON.parse(palette.colors),
      isBookmarked: userId ? (palette.bookmarkedPalettes && palette.bookmarkedPalettes.length > 0) : false,
      bookmarkedPalettes: undefined
    });
  } catch (error) {
    next(error);
  }
});

// Get public palettes by user ID (no auth required)
router.get('/public/user/:userId', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const parsedPalettes = palettes.map((p: any) => ({
      ...p,
      colors: JSON.parse(p.colors),
      isBookmarked: currentUserId ? (p.bookmarkedPalettes && p.bookmarkedPalettes.length > 0) : false,
      bookmarkedPalettes: undefined
    }));

    res.json(parsedPalettes);
  } catch (error) {
    next(error);
  }
});

// Get single palette
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const palette = await prisma.palette.findFirst({
      where: { id, userId },
      include: {
        category: { select: { name: true } }
      }
    })

    if (!palette) {
      throw createError('Palette not found', 404)
    }

    res.json({
      ...palette,
      colors: JSON.parse(palette.colors),
      category: palette.category?.name || null,
      categoryId: undefined
    })
  } catch (error) {
    next(error)
  }
})

// Create new palette
router.post('/',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('colors').isArray({ min: 1, max: 10 }),
    body('colors.*').matches(/^#[0-9A-Fa-f]{6}$/),
    body('category').optional().isString(),
    body('isPublic').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { name, colors, category, isPublic } = req.body
      const userId = req.user!.id

      // Handle category: find or create PaletteCategory
      let categoryId: string | undefined = undefined
      if (category && typeof category === 'string' && category.trim()) {
        const existingCategory = await prisma.paletteCategory.findUnique({
          where: { name: category.trim() }
        })
        if (existingCategory) {
          categoryId = existingCategory.id
        } else {
          const newCategory = await prisma.paletteCategory.create({
            data: { name: category.trim() }
          })
          categoryId = newCategory.id
        }
      }

      const palette = await prisma.palette.create({
        data: {
          name,
          colors: JSON.stringify(colors),
          isPublic: isPublic || false,
          userId,
          categoryId
        },
        include: {
          category: { select: { name: true } }
        }
      })

      // Create activity for palette creation
      await createActivity("PALETTE_CREATED", userId, { paletteId: palette.id });

      res.status(201).json({
        palette: {
          ...palette,
          colors: JSON.parse(palette.colors),
          category: palette.category?.name || null,
          categoryId: undefined
        }
      })
    } catch (error) {
      next(error)
    }
  }
)

// Update palette
router.put('/:id',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('colors').optional().isArray({ min: 1, max: 10 }),
    body('colors.*').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    body('isPublic').optional().isBoolean(),
    body('isFavorite').optional().isBoolean(),
    body('category').optional().isString(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        })
      }

      const { id } = req.params
      const { name, colors, isPublic, isFavorite, category } = req.body
      const userId = req.user!.id

      // Check if palette exists and belongs to user
      const existingPalette = await prisma.palette.findFirst({
        where: { id, userId }
      })

      if (!existingPalette) {
        throw createError('Palette not found', 404)
      }

      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (colors !== undefined) updateData.colors = JSON.stringify(colors)
      if (isPublic !== undefined) updateData.isPublic = isPublic
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite

      // Handle category: find or create PaletteCategory
      if (category !== undefined) {
        if (category && typeof category === 'string' && category.trim()) {
          const existingCategory = await prisma.paletteCategory.findUnique({
            where: { name: category.trim() }
          })
          if (existingCategory) {
            updateData.categoryId = existingCategory.id
          } else {
            const newCategory = await prisma.paletteCategory.create({
              data: { name: category.trim() }
            })
            updateData.categoryId = newCategory.id
          }
        } else {
          // If category is empty string or null, clear the category
          updateData.categoryId = null
        }
      }

      const palette = await prisma.palette.update({
        where: { id },
        data: updateData,
        include: {
          category: { select: { name: true } }
        }
      })

      res.json({
        ...palette,
        colors: JSON.parse(palette.colors),
        category: palette.category?.name || null,
        categoryId: undefined
      })
    } catch (error) {
      next(error)
    }
  }
)

// Toggle public visibility (explicit route so UI can call directly)
router.patch('/:id/public', authenticateToken, [body('isPublic').isBoolean()], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { id } = req.params
    const { isPublic } = req.body as { isPublic: boolean }
    const userId = req.user!.id

    const existingPalette = await prisma.palette.findFirst({ where: { id, userId } })
    if (!existingPalette) {
      throw createError('Palette not found', 404)
    }

    const updated = await prisma.palette.update({ where: { id }, data: { isPublic } })
    res.json({ ...updated, colors: JSON.parse(updated.colors) })
  } catch (error) {
    next(error)
  }
})

// Bookmark a public palette
router.post('/:id/bookmark', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if palette exists and is public
    const palette = await prisma.palette.findUnique({
      where: { id },
    });
    if (!palette || !palette.isPublic) {
      throw createError('Public palette not found', 404);
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
    await createActivity("PALETTE_BOOKMARKED", userId, { paletteId: id });

    res.status(201).json(bookmark);
  } catch (error) {
    next(error);
  }
});

// Unbookmark a public palette
router.delete('/:id/bookmark', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const bookmark = await prisma.bookmarkedPalette.delete({
      where: {
        userId_paletteId: {
          userId,
          paletteId: id,
        },
      },
    });

    res.status(200).json({ message: 'Palette unbookmarked successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all bookmarked palettes for the authenticated user
router.get('/me/bookmarked-palettes', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

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

    const parsedPalettes = bookmarkedPalettes.map((bp: any) => ({
      ...bp.palette,
      colors: JSON.parse(bp.palette.colors),
      isBookmarked: true, // Indicate that this palette is bookmarked by the current user
    }));

    res.json(parsedPalettes);
  } catch (error) {
    next(error);
  }
});

// Favorite functionality removed (isFavorite column no longer exists)
// Toggle favorite status (owner only)
router.patch('/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const palette = await prisma.palette.findFirst({ where: { id, userId } })
    if (!palette) {
      throw createError('Palette not found', 404)
    }

    const updated = await prisma.palette.update({
      where: { id },
      data: { isFavorite: !palette.isFavorite }
    });

    res.json({
      ...updated,
      colors: JSON.parse(updated.colors)
    })
  } catch (error) {
    next(error)
  }
})

// Delete palette
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const existingPalette = await prisma.palette.findFirst({
      where: { id, userId }
    })

    if (!existingPalette) {
      throw createError('Palette not found', 404)
    }

    await prisma.palette.delete({
      where: { id }
    })

    res.json({ message: 'Palette deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// Remix a public palette
router.post('/:id/remix', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Find the original palette
    const originalPalette = await prisma.palette.findUnique({
      where: { id },
    });

    if (!originalPalette || !originalPalette.isPublic) {
      throw createError('Public palette not found or not remixable', 404);
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
    await createActivity("PALETTE_REMIXED", userId, { paletteId: newPalette.id });

    res.status(201).json({
      palette: {
        ...newPalette,
        colors: JSON.parse(newPalette.colors),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router