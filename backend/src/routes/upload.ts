import express from 'express'
import { uploadImage, deleteImage, getUserImages } from '../controllers/uploadController'
import { upload } from '../middleware/upload'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Upload image (protected route)
router.post('/image', authenticateToken, upload.single('image'), uploadImage)

// Delete image (protected route)
router.delete('/image/:filename', authenticateToken, deleteImage)

// Get user images (protected route)
router.get('/images', authenticateToken, getUserImages)

export default router
