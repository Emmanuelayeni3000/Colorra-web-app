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
    : 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

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
