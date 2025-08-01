import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../../uploads')
    console.log('Upload destination directory:', uploadDir)
    
    // Create uploads directory if it doesn't exist
    try {
      await fs.access(uploadDir)
      console.log('Upload directory exists')
    } catch {
      console.log('Creating upload directory:', uploadDir)
      await fs.mkdir(uploadDir, { recursive: true })
    }
    
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'))
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Single file upload
  }
})

// Utility function to delete uploaded file
export const deleteUploadedFile = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '../../uploads', filename)
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

// Utility function to get file URL
export const getFileUrl = (filename: string): string => {
  return `http://localhost:5000/uploads/${filename}`
}

// Validate file upload
export const validateFileUpload = (file: Express.Multer.File | undefined) => {
  if (!file) {
    return { isValid: false, error: 'No file uploaded' }
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Only image files are allowed' }
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' }
  }

  return { isValid: true, error: null }
}
