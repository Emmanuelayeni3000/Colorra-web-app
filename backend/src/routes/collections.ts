import express from 'express'
import { 
  createCollection,
  getUserCollections,
  addPaletteToCollection,
  removePaletteFromCollection,
  deleteCollection,
  createCollectionValidation,
  addPaletteToCollectionValidation
} from '../controllers/collectionsController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Create collection (protected route)
router.post('/', authenticateToken, createCollectionValidation, createCollection)

// Get user collections (protected route)
router.get('/', authenticateToken, getUserCollections)

// Add palette to collection (protected route)
router.post('/palette', authenticateToken, addPaletteToCollectionValidation, addPaletteToCollection)

// Remove palette from collection (protected route)  
router.delete('/:collectionId/palette/:paletteId', authenticateToken, removePaletteFromCollection)

// Delete collection (protected route)
router.delete('/:collectionId', authenticateToken, deleteCollection)

export default router
