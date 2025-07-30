import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
  onColorsExtracted: (colors: string[]) => void
  onError?: (error: string) => void
}

interface UploadedImage {
  filename: string
  url: string
  originalName: string
  dominantColor: string
  colors: string[]
}

export default function ImageUpload({ onColorsExtracted, onError }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadedImage(data.data)
        onColorsExtracted(data.data.colors)
        toast.success('Colors extracted successfully!')
      } else {
        const errorMessage = data.message || 'Failed to upload image'
        toast.error(errorMessage)
        onError?.(errorMessage)
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = 'Network error. Please try again.'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const clearUploadedImage = () => {
    setUploadedImage(null)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mb-4">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload an image to extract colors
              </h3>
              <p className="text-sm text-gray-600">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Uploading...' : 'Choose Image'}</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Image Preview */}
      {uploadedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={uploadedImage.url}
                  alt={uploadedImage.originalName}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {uploadedImage.originalName}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Extracted {uploadedImage.colors.length} colors
                </p>
                <div className="flex space-x-1">
                  {uploadedImage.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedImage}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
