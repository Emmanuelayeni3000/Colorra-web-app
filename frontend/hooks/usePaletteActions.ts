import { useEffect } from 'react'
import { usePaletteStore } from '@/store/paletteStore'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export const usePaletteActions = () => {
  const { 
    setPalettes, 
    addPalette, 
    updatePalette, 
    deletePalette: removePalette, 
    setLoading, 
    setCreating,
    setError 
  } = usePaletteStore()
  const { isAuthenticated } = useAuthStore()

  // Load palettes when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPalettes()
    } else {
      setPalettes([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const loadPalettes = async (favorites?: boolean) => {
    try {
      setLoading(true)
      setError(null)
      const palettes = await apiClient.getPalettes(favorites)
      // Backend returns array, not { data: [...] }
      setPalettes(palettes)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load palettes'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const createPalette = async (paletteData: {
    name: string
    description?: string
    colors: string[]
    imageUrl?: string
  }) => {
    try {
      setCreating(true)
      setError(null)
      const response = await apiClient.createPalette(paletteData)
      // Backend returns { palette: {...} }
      const newPalette = response.palette
      // Add to local store immediately for quick UI update
      addPalette(newPalette)
      // Ensure loading state is false so dashboard shows palettes
      setLoading(false)
      toast.success('Palette created successfully!')
      return newPalette
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create palette'
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setCreating(false)
    }
  }

  const editPalette = async (
    id: string, 
    updates: {
      name?: string
      description?: string
      colors?: string[]
      imageUrl?: string
      isFavorite?: boolean
    }
  ) => {
    try {
      setLoading(true)
      const updatedPalette = await apiClient.updatePalette(id, updates)
      updatePalette(id, updatedPalette)
      toast.success('Palette updated successfully!')
      return updatedPalette
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update palette'
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (id: string) => {
    try {
      const updatedPalette = await apiClient.toggleFavorite(id)
      updatePalette(id, updatedPalette)
      toast.success(
        updatedPalette.isFavorite 
          ? 'Added to favorites!' 
          : 'Removed from favorites!'
      )
      return updatedPalette
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update favorite'
      toast.error(message)
      throw error
    }
  }

  const deletePalette = async (id: string) => {
    try {
      setLoading(true)
      await apiClient.deletePalette(id)
      removePalette(id)
      toast.success('Palette deleted successfully!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete palette'
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loadPalettes,
    createPalette,
    editPalette,
    toggleFavorite,
    deletePalette
  }
}
