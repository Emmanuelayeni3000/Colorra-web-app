import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { 
  getProfile, 
  updateProfile, 
  changePassword,
  uploadAvatar,
  updateProfileValidation,
  changePasswordValidation
} from '../controllers/profileController'

const router = express.Router()

// All profile routes require authentication
router.use(authenticateToken)

// GET /api/profile - Get user profile
router.get('/', getProfile)

// PUT /api/profile - Update user profile  
router.put('/', updateProfileValidation, updateProfile)

// PUT /api/profile/password - Change password
router.put('/password', changePasswordValidation, changePassword)

// POST /api/profile/avatar - Upload avatar
router.post('/avatar', upload.single('avatar'), uploadAvatar)

export default router
