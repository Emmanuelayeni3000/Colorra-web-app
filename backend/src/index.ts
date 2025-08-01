import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/auth'
import paletteRoutes from './routes/palettes'
import profileRoutes from './routes/profile'
import searchRoutes from './routes/search'
import passwordResetRoutes from './routes/passwordReset'
import uploadRoutes from './routes/upload'
import sharingRoutes from './routes/sharing'
import collectionsRoutes from './routes/collections'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.path.includes('/avatar')) {
    console.log('Avatar request headers:', req.headers)
    console.log('Avatar request file:', !!req.file)
  }
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
const uploadsPath = path.resolve(__dirname, '../uploads')
console.log('Serving static files from:', uploadsPath)
app.use('/uploads', express.static(uploadsPath))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/palettes', paletteRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/password-reset', passwordResetRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/sharing', sharingRoutes)
app.use('/api/collections', collectionsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Test upload directory
app.get('/api/test-uploads', (req, res) => {
  const uploadsPath = path.resolve(__dirname, '../uploads')
  const fs = require('fs')
  
  try {
    const files = fs.readdirSync(uploadsPath)
    res.json({ 
      status: 'OK', 
      uploadsPath,
      files,
      message: 'Upload directory accessible'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      uploadsPath,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Upload directory not accessible'
    })
  }
})

// Test JWT token verification
app.get('/api/test-auth', (req, res) => {
  const jwt = require('jsonwebtoken')
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.json({ 
      status: 'NO_TOKEN',
      message: 'No authorization header or token found',
      authHeader 
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    res.json({ 
      status: 'VALID_TOKEN',
      decoded,
      message: 'Token is valid',
      tokenStart: token.substring(0, 20)
    })
  } catch (error) {
    res.json({ 
      status: 'INVALID_TOKEN',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Token verification failed',
      tokenStart: token.substring(0, 20),
      jwtSecret: !!process.env.JWT_SECRET
    })
  }
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
})
