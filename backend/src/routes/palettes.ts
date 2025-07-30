import express, { Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = express.Router()
const prisma = new PrismaClient()

// Get all palettes for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { favorites } = req.query
    const userId = req.user!.id
    // console.log(`[GET /api/palettes] userId: ${userId}, favorites: ${favorites}`)

    const whereClause: any = { userId }
    if (favorites === 'true') {
      whereClause.isFavorite = true
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
    })
   

    // Parse colors JSON string back to array
    const parsedPalettes = palettes.map(palette => ({
      ...palette,
      colors: JSON.parse(palette.colors)
    }))

    res.json(parsedPalettes)
  } catch (error) {
    next(error)
  }
})

// Get single palette
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const palette = await prisma.palette.findFirst({
      where: { id, userId }
    })

    if (!palette) {
      throw createError('Palette not found', 404)
    }

    res.json({
      ...palette,
      colors: JSON.parse(palette.colors)
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
    body('description').optional().trim().isLength({ max: 500 }),
    body('colors').isArray({ min: 1, max: 10 }),
    body('colors.*').matches(/^#[0-9A-Fa-f]{6}$/),
    body('imageUrl').optional().isURL()
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

      const { name, description, colors, imageUrl } = req.body
      const userId = req.user!.id

      const palette = await prisma.palette.create({
        data: {
          name,
          description: description || null,
          colors: JSON.stringify(colors),
          imageUrl: imageUrl || null,
          userId
        }
      })

      res.status(201).json({
        palette: {
          ...palette,
          colors: JSON.parse(palette.colors)
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
    body('description').optional().trim().isLength({ max: 500 }),
    body('colors').optional().isArray({ min: 1, max: 10 }),
    body('colors.*').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    body('imageUrl').optional().isURL(),
    body('isFavorite').optional().isBoolean()
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
      const { name, description, colors, imageUrl, isFavorite } = req.body
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
      if (description !== undefined) updateData.description = description
      if (colors !== undefined) updateData.colors = JSON.stringify(colors)
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite

      const palette = await prisma.palette.update({
        where: { id },
        data: updateData
      })

      res.json({
        ...palette,
        colors: JSON.parse(palette.colors)
      })
    } catch (error) {
      next(error)
    }
  }
)

// Toggle favorite status
router.patch('/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const existingPalette = await prisma.palette.findFirst({
      where: { id, userId }
    })

    if (!existingPalette) {
      throw createError('Palette not found', 404)
    }

    const palette = await prisma.palette.update({
      where: { id },
      data: { isFavorite: !existingPalette.isFavorite }
    })

    res.json({
      ...palette,
      colors: JSON.parse(palette.colors)
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

export default router
