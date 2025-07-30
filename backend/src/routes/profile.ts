import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { 
  getProfile, 
  updateProfile, 
  changePassword,
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

export default router
