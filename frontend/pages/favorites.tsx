import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Menu, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaletteStore } from '@/store/paletteStore'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import Sidebar from '@/components/layout/Sidebar'
import PaletteCard from '@/components/palette/PaletteCard'
import SEO, { pageSEO } from '@/components/SEO'

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated, hasHydrated } = useAuthStore()
  const { getFavorites, isLoading } = usePaletteStore()
  const { loadPalettes } = usePaletteActions()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Wait for hydration before checking auth and redirecting
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/signin?redirect=/favorites')
    }
  }, [hasHydrated, isAuthenticated, router])

  // Load user's own palettes to get favorites (only after hydration and authentication)
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      loadPalettes(false, searchTerm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, searchTerm])

  // Get favorite palettes from user's own palettes
  const favoritePalettes = getFavorites()

  // Filter favorite palettes by search term
  const filteredPalettes = favoritePalettes.filter(palette =>
    palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 20
  const totalPages = Math.ceil(filteredPalettes.length / pageSize)
  const paginatedPalettes = filteredPalettes.slice((page - 1) * pageSize, page * pageSize)

  // Show loading while waiting for hydration
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-purple-50/30 to-teal-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-500"></div>
          </div>
          <p className="text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/30 to-teal-50/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        favoriteCount={favoritePalettes.length}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation - Glassmorphism */}
        <header className="sticky top-0 z-30 glass-dark border-b border-white/20 shadow-glass px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-purple-50 rounded-xl transition-smooth"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    Favorite Palettes
                  </h1>
                  <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                </div>
                <p className="text-sm sm:text-base text-neutral-500">
                  {filteredPalettes.length} favorite palette{filteredPalettes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="px-4 py-6 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-lg group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-purple-500 transition-smooth" />
              <Input
                placeholder="Search favorite palettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-white/80 backdrop-blur-sm border-neutral-200/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-smooth"
              />
            </div>
          </div>

          {/* Palettes Grid */}
          {isLoading && filteredPalettes.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            </div>
          ) : filteredPalettes.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-2 border-neutral-200 bg-white/50 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <CardTitle className="text-neutral-700 text-xl">
                  {searchTerm 
                    ? 'No favorite palettes found matching your search' 
                    : 'You haven\'t marked any palettes as favorites yet'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-500 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms or clear the search'
                    : 'Create some palettes and mark them as favorites to see them here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedPalettes.map((palette) => (
                  <PaletteCard key={palette.id} palette={palette} />
                ))}
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-10 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="min-w-[100px] rounded-xl border-neutral-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 disabled:opacity-50 transition-smooth"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 py-2 bg-white/80 rounded-xl border border-neutral-200">
                    <span className="text-sm font-medium text-neutral-600">
                      Page <span className="text-purple-600">{page}</span> of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="min-w-[100px] rounded-xl border-neutral-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 disabled:opacity-50 transition-smooth"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Protect this page
FavoritesPage.requireAuth = true
