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

  async forgotPassword(data: { email: string }) {
    try {
      const response = await this.client.post('/password-reset/request', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async resetPassword(data: { token: string; password: string }) {
    try {
      const response = await this.client.post('/password-reset/reset', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async verifyEmail(token: string) {
    try {
      const response = await this.client.get(`/auth/verify-email?token=${token}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const response = await this.client.post('/auth/resend-verification', { email })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async completeTutorial() {
    try {
      const response = await this.client.patch('/auth/tutorial-complete')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Palette endpoints
  async getPalettes(favorites?: boolean, searchTerm?: string) {
    try {
      const params: Record<string, string> = {}
      if (favorites) {
        params.favorites = 'true'
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await this.client.get('/palettes', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getPublicPalettes(category?: string) {
    try {
      const params: Record<string, string> = {};
      if (category) {
        params.category = category;
      }
      const response = await this.client.get('/palettes/public', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getExploreStats() {
    try {
      const response = await this.client.get('/palettes/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPrivatePaletteById(id: string) {
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
    isPublic?: boolean
    category?: string
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
      isPublic?: boolean
      category?: string
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

  async remixPalette(id: string) {
    try {
      const response = await this.client.post(`/palettes/${id}/remix`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async bookmarkPalette(id: string) {
    try {
      const response = await this.client.post(`/palettes/${id}/bookmark`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async unbookmarkPalette(id: string) {
    try {
      const response = await this.client.delete(`/palettes/${id}/bookmark`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getBookmarkedPalettes() {
    try {
      const response = await this.client.get('/palettes/me/bookmarked-palettes');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPublicPaletteById(id: string) {
    try {
      const response = await this.client.get(`/palettes/public/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Comment endpoints
  async getCommentsForPalette(paletteId: string) {
    try {
      const response = await this.client.get(`/palettes/${paletteId}/comments`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addCommentToPalette(paletteId: string, content: string) {
    try {
      const response = await this.client.post(`/palettes/${paletteId}/comments`, { content });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateComment(commentId: string, content: string) {
    try {
      const response = await this.client.put(`/palettes/${commentId}`, { content });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId: string) {
    try {
      const response = await this.client.delete(`/palettes/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // User/Profile endpoints
  async updateProfile(data: { name?: string; email?: string }) {
    try {
      const response = await this.client.put('/profile', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async uploadAvatar(file: File) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await this.client.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getProfile() {
    try {
      const response = await this.client.get('/profile')
      return response.data
    } catch (error) {
      throw error
    }
  }

  async getProfileById(userId: string) {
    try {
      const response = await this.client.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPublicPalettesByUserId(userId: string) {
    try {
      const response = await this.client.get(`/palettes/public/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPaletteOfTheDay() {
    try {
      const response = await this.client.get('/palettes/daily');
      // New backend format wraps in { palette, autoSelected, message? }
      if (response.data && typeof response.data === 'object') {
        if ('palette' in response.data) {
          return response.data.palette; // may be null
        }
      }
      // Fallback to previous direct palette shape
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Follow endpoints
  async followUser(userId: string) {
    try {
      const response = await this.client.post(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Sharing endpoints
  async searchUsers(query: string) {
    try {
      const response = await this.client.get(`/sharing/search-users?query=${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async sharePalette(paletteId: string, sharedWithId: string) {
    try {
      // Sharing routes are mounted under /api/sharing
      const response = await this.client.post(`/sharing/${paletteId}/share`, { sharedWithId });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSharedPalettes() {
    try {
      // Corrected path: mounted at /api/sharing
      const response = await this.client.get('/sharing/shared-with-me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async unfollowUser(userId: string) {
    try {
      const response = await this.client.delete(`/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFollowers(userId: string) {
    try {
      const response = await this.client.get(`/users/${userId}/followers`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFollowing(userId: string) {
    try {
      const response = await this.client.get(`/users/${userId}/following`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Activity Feed endpoints
  async getGlobalActivityFeed(limit?: number, offset?: number) {
    try {
      const params: Record<string, string> = {};
      if (limit !== undefined) params.limit = String(limit);
      if (offset !== undefined) params.offset = String(offset);
      const response = await this.client.get('/activity/global', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPersonalizedActivityFeed(limit?: number, offset?: number) {
    try {
      const params: Record<string, string> = {};
      if (limit !== undefined) params.limit = String(limit);
      if (offset !== undefined) params.offset = String(offset);
      const response = await this.client.get('/activity/me', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteActivity(activityId: string) {
    try {
      const response = await this.client.delete(`/activity/${activityId}`);
      return response.data;
    } catch (error) {
      throw error;
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

  async post(url: string, data?: unknown, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.post(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async put(url: string, data?: unknown, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.put(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async patch(url: string, data?: unknown, config?: AxiosRequestConfig) {
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

  async togglePublic(id: string, isPublic: boolean) {
    try {
      const response = await this.client.patch(`/palettes/${id}/public`, { isPublic })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient
