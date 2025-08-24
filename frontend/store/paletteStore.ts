import { create } from 'zustand'

export interface Palette {
  id: string
  userId: string
  name: string
  description?: string
  colors: string[]
  imageUrl?: string
  isFavorite: boolean
  isPublic: boolean
  isBookmarked?: boolean
  category?: string; // Added category property
  createdAt: string
  updatedAt: string
  user?: {
    id?: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
}

interface PaletteState {
  palettes: Palette[]
  publicPalettes: Palette[]
  bookmarkedPalettes: Palette[]
  currentPalette: Palette | null
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean // Added
  error: string | null
  
  // Actions
  setPalettes: (palettes: Palette[]) => void
  setPublicPalettes: (palettes: Palette[]) => void
  setBookmarkedPalettes: (palettes: Palette[]) => void
  addPalette: (palette: Palette) => void
  updatePalette: (id: string, updates: Partial<Palette>) => void
  deletePalette: (id: string) => void
  setCurrentPalette: (palette: Palette | null) => void
  toggleFavorite: (id: string) => void
  setLoading: (loading: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void // Added
  setError: (error: string | null) => void
  getFavorites: () => Palette[]
  clearPalettes: () => void
}

export const usePaletteStore = create<PaletteState>((set, get) => ({
  palettes: [],
  publicPalettes: [],
  bookmarkedPalettes: [],
  currentPalette: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false, // Added
  error: null,
  
  setPalettes: (palettes: Palette[]) => {
    set({ palettes, error: null })
  },

  setPublicPalettes: (palettes: Palette[]) => {
    set({ publicPalettes: palettes, error: null })
  },

  setBookmarkedPalettes: (palettes: Palette[]) => {
    set({ bookmarkedPalettes: palettes, error: null })
  },
  
  addPalette: (palette: Palette) => {
    set((state) => ({
      palettes: [palette, ...state.palettes],
      error: null,
    }))
  },
  
  updatePalette: (id: string, updates: Partial<Palette>) => {
    set((state) => {
      const updatedPalettes = state.palettes.map((palette) =>
        palette.id === id ? { ...palette, ...updates } : palette
      );
      let updatedPublicPalettes = state.publicPalettes.map((palette) =>
        palette.id === id ? { ...palette, ...updates } : palette
      );

      // Ensure membership in publicPalettes reflects isPublic changes
      if (Object.prototype.hasOwnProperty.call(updates, 'isPublic')) {
        const isPublic = updates.isPublic;
        const target = updatedPalettes.find(p => p.id === id);
        if (isPublic) {
          const already = updatedPublicPalettes.some(p => p.id === id);
            if (!already && target) {
              updatedPublicPalettes = [target, ...updatedPublicPalettes];
            }
        } else if (isPublic === false) {
          updatedPublicPalettes = updatedPublicPalettes.filter(p => p.id !== id);
        }
      }

      let updatedBookmarkedPalettes = state.bookmarkedPalettes;
      const existingBookmarkedPalette = state.bookmarkedPalettes.find(p => p.id === id);

      if (updates.isBookmarked === true && !existingBookmarkedPalette) {
        // If bookmarked and not already in bookmarkedPalettes, add it
        const paletteToAdd = updatedPalettes.find(p => p.id === id) || updatedPublicPalettes.find(p => p.id === id);
        if (paletteToAdd) {
          updatedBookmarkedPalettes = [...state.bookmarkedPalettes, paletteToAdd];
        }
      } else if (updates.isBookmarked === false && existingBookmarkedPalette) {
        // If unbookmarked and in bookmarkedPalettes, remove it
        updatedBookmarkedPalettes = state.bookmarkedPalettes.filter(p => p.id !== id);
      } else if (existingBookmarkedPalette) {
        // If already bookmarked, just update its properties
        updatedBookmarkedPalettes = state.bookmarkedPalettes.map(p => 
          p.id === id ? { ...p, ...updates } : p
        );
      }

      return {
        palettes: updatedPalettes,
        publicPalettes: updatedPublicPalettes,
        bookmarkedPalettes: updatedBookmarkedPalettes,
        currentPalette:
          state.currentPalette?.id === id
            ? { ...state.currentPalette, ...updates }
            : state.currentPalette,
        error: null,
      };
    });
  },
  
  deletePalette: (id: string) => {
    set((state) => ({
      palettes: state.palettes.filter((palette) => palette.id !== id),
      publicPalettes: state.publicPalettes.filter((palette) => palette.id !== id),
      bookmarkedPalettes: state.bookmarkedPalettes.filter((palette) => palette.id !== id),
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
      publicPalettes: state.publicPalettes.map((palette) =>
        palette.id === id
          ? { ...palette, isFavorite: !palette.isFavorite }
          : palette
      ),
      bookmarkedPalettes: state.bookmarkedPalettes.map((palette) =>
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
  
  setCreating: (creating: boolean) => {
    set({ isCreating: creating })
  },

  setUpdating: (updating: boolean) => { // Added
    set({ isUpdating: updating })
  },
  
  setError: (error: string | null) => {
    set({ error })
  },
  
  getFavorites: () => {
    return get().palettes.filter((palette) => palette.isFavorite)
  },
  
  clearPalettes: () => {
    set({ palettes: [], publicPalettes: [], bookmarkedPalettes: [], currentPalette: null, error: null })
  },
}))