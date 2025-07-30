import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
          window.location.href = '/signin'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async signUp(data: { name: string; email: string; password: string }) {
    try {
      const response = await this.client.post('/auth/signup', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async signIn(data: { email: string; password: string }) {
    try {
      const response = await this.client.post('/auth/signin', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Palette endpoints
  async getPalettes(favorites?: boolean) {
    try {
      const params = favorites ? { favorites: 'true' } : {}
      const response = await this.client.get('/palettes', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPalette(id: string) {
    try {
      const response = await this.client.get(`/palettes/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async createPalette(data: {
    name: string
    description?: string
    colors: string[]
    imageUrl?: string
  }) {
    try {
      const response = await this.client.post('/palettes', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async updatePalette(
    id: string,
    data: {
      name?: string
      description?: string
      colors?: string[]
      imageUrl?: string
      isFavorite?: boolean
    }
  ) {
    try {
      const response = await this.client.put(`/palettes/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async toggleFavorite(id: string) {
    try {
      const response = await this.client.patch(`/palettes/${id}/favorite`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async deletePalette(id: string) {
    try {
      const response = await this.client.delete(`/palettes/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Generic methods
  async get(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.get(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.post(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.put(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.patch(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.delete(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient
