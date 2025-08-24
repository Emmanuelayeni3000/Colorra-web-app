import express from 'express';
import { sharePalette, getSharedPalettes, searchUsers } from '../controllers/sharingController';
import { authenticateToken } from '../middleware/auth'; // Fixed import name

const router = express.Router();

// Share a palette with another user
router.post('/:paletteId/share', authenticateToken, sharePalette);

// Get palettes shared with the authenticated user
router.get('/shared-with-me', authenticateToken, getSharedPalettes);

// Search for users
router.get('/search-users', authenticateToken, searchUsers);

export default router;