import express from 'express'
import { 
  sharePalette, 
  getSharedPalettes, 
  getMySharedPalettes, 
  removePaletteShare,
  sharePaletteValidation 
} from '../controllers/sharingController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Share a palette (protected route)
router.post('/share', authenticateToken, sharePaletteValidation, sharePalette)

// Get palettes shared with me (protected route)
router.get('/received', authenticateToken, getSharedPalettes)

// Get palettes I've shared (protected route)
router.get('/sent', authenticateToken, getMySharedPalettes)

// Remove palette share (protected route)
router.delete('/:shareId', authenticateToken, removePaletteShare)

export default router
