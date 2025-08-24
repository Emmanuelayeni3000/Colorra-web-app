import { useCallback } from 'react'
import { usePaletteStore } from '@/store/paletteStore'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// Helper to safely extract an API error message
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error && 'response' in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response
    const msg = resp?.data?.message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

interface PaletteUpdateData {
  name?: string
  description?: string
  colors?: string[]
  imageUrl?: string
  isFavorite?: boolean
  isPublic?: boolean
  category?: string
}

export const usePaletteActions = () => {
  const { 
    setPalettes, 
    addPalette, 
    updatePalette, 
    deletePalette: removePalette, 
    setLoading, 
    setCreating,
    setUpdating, // Added
    setError,
    setBookmarkedPalettes // Added
  } = usePaletteStore()
  // (Removed unused auth state)



  const loadPalettes = async (favorites?: boolean, searchTerm?: string) => {
    try {
      setLoading(true)
      setError(null)
      const palettes = await apiClient.getPalettes(favorites, searchTerm)
      // Backend returns array, not { data: [...] }
      setPalettes(palettes)
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to load palettes')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const loadBookmarkedPalettes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const palettes = await apiClient.getBookmarkedPalettes()
      setBookmarkedPalettes(palettes)
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to load bookmarked palettes')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array since Zustand setters are stable

  const createPalette = async (paletteData: {
    name: string
    description?: string
    colors: string[]
    imageUrl?: string
    isPublic?: boolean
    category?: string
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
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to create palette')
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setCreating(false)
    }
  }

  const editPalette = async (
    id: string, 
    updates: PaletteUpdateData
  ) => {
    try {
      setUpdating(true) // Changed from setLoading
      const updatedPalette = await apiClient.updatePalette(id, updates)
      updatePalette(id, updatedPalette)
      toast.success('Palette updated successfully!')
      return updatedPalette
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to update palette')
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setUpdating(false) // Changed from setLoading
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
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to update favorite')
      toast.error(message)
      throw error
    }
  }

  const togglePublic = async (id: string, currentIsPublic: boolean) => {
    // Optimistic update
    updatePalette(id, { isPublic: !currentIsPublic })
    try {
      const updated = await apiClient.togglePublic(id, !currentIsPublic)
      // Ensure store has any additional fields returned (e.g., updatedAt)
      updatePalette(id, updated)
      toast.success(
        updated.isPublic ? 'Palette is now public!' : 'Palette set to private.'
      )
      return updated
    } catch (error: unknown) {
      // Revert on failure
      updatePalette(id, { isPublic: currentIsPublic })
      const message = getApiErrorMessage(error, 'Failed to toggle public state')
      toast.error(message)
      throw error
    }
  }

  const toggleBookmark = useCallback(async (id: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await apiClient.unbookmarkPalette(id)
        updatePalette(id, { isBookmarked: false })
        toast.success('Removed from bookmarks!')
      } else {
        await apiClient.bookmarkPalette(id)
        updatePalette(id, { isBookmarked: true })
        toast.success('Added to bookmarks!')
      }
      // Refresh bookmarked palettes to ensure consistency
      loadBookmarkedPalettes()
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to update bookmark')
      toast.error(message)
      throw error
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array since Zustand setters and memoized functions are stable

  const deletePalette = async (id: string) => {
    try {
      setLoading(true)
      await apiClient.deletePalette(id)
      removePalette(id)
      toast.success('Palette deleted successfully!')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Failed to delete palette')
      setError(message)
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loadPalettes,
    loadBookmarkedPalettes,
    createPalette,
    editPalette,
    toggleFavorite,
  togglePublic,
    toggleBookmark,
    deletePalette
  }
}