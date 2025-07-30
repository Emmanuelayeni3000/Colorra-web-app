import ColorThief from 'colorthief'

export interface ExtractedColor {
  hex: string
  rgb: [number, number, number]
}

export const extractColorsFromImage = async (
  imageFile: File,
  colorCount: number = 5
): Promise<ExtractedColor[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      try {
        // Set canvas dimensions
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0)
        
        // Initialize ColorThief
        const colorThief = new ColorThief()
        
        // Extract colors
        const palette = colorThief.getPalette(img, colorCount)
        
        if (!palette) {
          reject(new Error('Could not extract colors from image'))
          return
        }
        
        // Convert RGB to hex
        const colors: ExtractedColor[] = palette.map((rgb: [number, number, number]) => ({
          rgb,
          hex: rgbToHex(rgb[0], rgb[1], rgb[2])
        }))
        
        resolve(colors)
      } catch (error) {
        reject(new Error('Failed to extract colors: ' + (error as Error).message))
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    // Create object URL and set as image source
    const objectUrl = URL.createObjectURL(imageFile)
    
    const originalOnLoad = img.onload
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (originalOnLoad) {
        originalOnLoad.call(img, new Event('load'))
      }
    }
    
    img.src = objectUrl
  })
}

// Helper function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Validate image file
export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Please upload an image smaller than 5MB.')
  }
  
  return true
}

// Generate a complementary color palette
export const generateComplementaryColors = (baseColor: string): string[] => {
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Convert to HSL
  const { h, s, l } = rgbToHsl(r, g, b)
  
  // Generate complementary colors
  const colors = [
    baseColor,
    hslToHex((h + 30) % 360, s, Math.min(l + 0.1, 1)),
    hslToHex((h + 60) % 360, s, l),
    hslToHex((h + 180) % 360, s, l), // Complementary
    hslToHex((h + 210) % 360, s, Math.max(l - 0.1, 0))
  ]
  
  return colors
}

// Helper functions for color conversion
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    
    h /= 6
  }
  
  return { h: h * 360, s, l }
}

const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return rgbToHex(
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  )
}
