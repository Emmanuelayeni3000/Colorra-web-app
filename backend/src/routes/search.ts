import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { searchPalettes, getColorSuggestions, getPopularColors } from '../controllers/searchController'
import { query } from 'express-validator'

const router = express.Router()

// All search routes require authentication
router.use(authenticateToken)

// GET /api/search/palettes - Advanced palette search
router.get('/palettes', [
  query('query').optional().isString().trim().isLength({ max: 100 }),
  query('colors').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('favorites').optional().isBoolean(),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], searchPalettes)

// GET /api/search/colors/suggestions - Get color suggestions for autocomplete
router.get('/colors/suggestions', [
  query('query').isString().trim().isLength({ min: 1, max: 20 })
], getColorSuggestions)

// GET /api/search/colors/popular - Get popular colors from user's palettes
router.get('/colors/popular', getPopularColors)

export default router
