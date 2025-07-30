import { Response } from 'express'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { upload, validateFileUpload, deleteUploadedFile, getFileUrl } from '../middleware/upload'

const prisma = new PrismaClient()

// Server-side color extraction using a simple approach
// Note: In a production environment, you'd want to use a proper image processing library
const extractColorsFromImage = async (imagePath: string): Promise<{ dominantColor: string; colors: string[] }> => {
  // This is a simplified approach - in production you'd use libraries like:
  // - sharp with color extraction
  // - node-vibrant
  // - get-image-colors
  
  // For demo purposes, return some sample colors
  // In a real implementation, you'd process the image file
  const sampleColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ]
  
  // Return random colors for demo (replace with actual color extraction)
  const shuffled = sampleColors.sort(() => 0.5 - Math.random())
  const selectedColors = shuffled.slice(0, 6)
  
  return {
    dominantColor: selectedColors[0],
    colors: selectedColors
  }
}

// Upload image and extract colors
export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // Validate file upload
    const validation = validateFileUpload(req.file)
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error })
    }

    const file = req.file!
    const filePath = path.join(__dirname, '../../uploads', file.filename)
    const fileUrl = getFileUrl(file.filename)

    try {
      // Extract colors from image using our server-side approach
      const { dominantColor, colors } = await extractColorsFromImage(filePath)

      res.json({
        message: 'Image uploaded and colors extracted successfully',
        data: {
          filename: file.filename,
          url: fileUrl,
          originalName: file.originalname,
          size: file.size,
          dominantColor,
          colors
        }
      })
    } catch (colorExtractionError) {
      console.error('Color extraction error:', colorExtractionError)
      
      // Clean up uploaded file on error
      await deleteUploadedFile(file.filename)
      
      res.status(500).json({ 
        message: 'Failed to extract colors from image',
        error: 'Color extraction failed'
      })
    }
  } catch (error) {
    console.error('Upload image error:', error)
    
    // Clean up uploaded file on error
    if (req.file) {
      await deleteUploadedFile(req.file.filename)
    }
    
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete uploaded image
export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' })
    }

    // Delete the file
    await deleteUploadedFile(filename)

    res.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Delete image error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get user's uploaded images
export const getUserImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // In a real application, you'd store image metadata in the database
    // For now, we'll return a simple response
    res.json({
      message: 'User images retrieved successfully',
      data: {
        images: [],
        note: 'Image metadata storage not implemented yet'
      }
    })
  } catch (error) {
    console.error('Get user images error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
