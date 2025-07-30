// Enhanced form validation utilities

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address'
  return null
}

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character'
  return null
}

// Name validation
export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 50) return 'Name must be less than 50 characters'
  return null
}

// Palette name validation
export const validatePaletteName = (name: string): string | null => {
  if (!name?.trim()) return 'Palette name is required'
  if (name.length > 100) return 'Palette name must be less than 100 characters'
  return null
}

// Description validation
export const validateDescription = (description: string): string | null => {
  if (description && description.length > 500) return 'Description must be less than 500 characters'
  return null
}

// Colors validation
export const validateColors = (colors: string[]): string | null => {
  if (!colors || colors.length === 0) return 'At least one color is required'
  if (colors.length > 10) return 'Maximum 10 colors allowed'
  
  for (const color of colors) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return `Invalid color format: ${color}`
    }
  }
  return null
}

// URL validation
export const validateUrl = (url: string): string | null => {
  if (url && url.trim()) {
    try {
      new URL(url)
    } catch {
      return 'Please enter a valid URL'
    }
  }
  return null
}

// Sign up form validation
export const validateSignUpForm = (data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): ValidationResult => {
  const errors: Record<string, string> = {}

  const nameError = validateName(data.name)
  if (nameError) errors.name = nameError

  const emailError = validateEmail(data.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(data.password)
  if (passwordError) errors.password = passwordError

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords don't match"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Create palette form validation
export const validateCreatePaletteForm = (data: {
  name: string
  description?: string
  colors: string[]
  imageUrl?: string
}): ValidationResult => {
  const errors: Record<string, string> = {}

  const nameError = validatePaletteName(data.name)
  if (nameError) errors.name = nameError

  const descriptionError = validateDescription(data.description || '')
  if (descriptionError) errors.description = descriptionError

  const colorsError = validateColors(data.colors)
  if (colorsError) errors.colors = colorsError

  const urlError = validateUrl(data.imageUrl || '')
  if (urlError) errors.imageUrl = urlError

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
