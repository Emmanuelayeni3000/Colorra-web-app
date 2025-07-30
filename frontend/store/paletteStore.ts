import { create } from 'zustand'

export interface Palette {
  id: string
  userId: string
  name: string
  description?: string
  colors: string[]
  imageUrl?: string
  isFavorite: boolean
  createdAt: string
}

interface PaletteState {
  palettes: Palette[]
  currentPalette: Palette | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setPalettes: (palettes: Palette[]) => void
  addPalette: (palette: Palette) => void
  updatePalette: (id: string, updates: Partial<Palette>) => void
  deletePalette: (id: string) => void
  setCurrentPalette: (palette: Palette | null) => void
  toggleFavorite: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getFavorites: () => Palette[]
  clearPalettes: () => void
}

export const usePaletteStore = create<PaletteState>((set, get) => ({
  palettes: [],
  currentPalette: null,
  isLoading: false,
  error: null,
  
  setPalettes: (palettes: Palette[]) => {
    set({ palettes, error: null })
  },
  
  addPalette: (palette: Palette) => {
    set((state) => ({
      palettes: [palette, ...state.palettes],
      error: null,
    }))
  },
  
  updatePalette: (id: string, updates: Partial<Palette>) => {
    set((state) => ({
      palettes: state.palettes.map((palette) =>
        palette.id === id ? { ...palette, ...updates } : palette
      ),
      currentPalette:
        state.currentPalette?.id === id
          ? { ...state.currentPalette, ...updates }
          : state.currentPalette,
      error: null,
    }))
  },
  
  deletePalette: (id: string) => {
    set((state) => ({
      palettes: state.palettes.filter((palette) => palette.id !== id),
      currentPalette:
        state.currentPalette?.id === id ? null : state.currentPalette,
      error: null,
    }))
  },
  
  setCurrentPalette: (palette: Palette | null) => {
    set({ currentPalette: palette })
  },
  
  toggleFavorite: (id: string) => {
    set((state) => ({
      palettes: state.palettes.map((palette) =>
        palette.id === id
          ? { ...palette, isFavorite: !palette.isFavorite }
          : palette
      ),
      currentPalette:
        state.currentPalette?.id === id
          ? { ...state.currentPalette, isFavorite: !state.currentPalette.isFavorite }
          : state.currentPalette,
    }))
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  setError: (error: string | null) => {
    set({ error })
  },
  
  getFavorites: () => {
    return get().palettes.filter((palette) => palette.isFavorite)
  },
  
  clearPalettes: () => {
    set({ palettes: [], currentPalette: null, error: null })
  },
}))
