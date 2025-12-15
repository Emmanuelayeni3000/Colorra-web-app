import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  hasSeenTutorial?: boolean
  _count?: {
    followers: number
    following: number
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hasHydrated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setHasHydrated: (state: boolean) => void
  setTutorialCompleted: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (user: User, token: string) => {
        // Ensure backward compatibility for users without _count
        const userWithDefaults = {
          ...user,
          _count: user._count || {
            followers: 0,
            following: 0
          }
        }

        set({
          user: userWithDefaults,
          token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state })
      },

      setTutorialCompleted: () => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, hasSeenTutorial: true }
          })
        }
      },
    }),
    {
      name: 'colorra-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Don't persist hasHydrated - it's runtime only
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as AuthState
        // Migration for adding _count to existing users
        if (version === 0 && state.user && !state.user._count) {
          state.user._count = {
            followers: 0,
            following: 0
          }
        }
        return state
      },
      onRehydrateStorage: () => (state) => {
        // Called when rehydration finishes
        state?.setHasHydrated(true)
      },
    }
  )
)
