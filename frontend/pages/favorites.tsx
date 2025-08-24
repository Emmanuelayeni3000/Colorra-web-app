import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaletteStore } from '@/store/paletteStore'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import Sidebar from '@/components/layout/Sidebar'
import PaletteCard from '@/components/palette/PaletteCard' // Changed to PaletteCard for user's own palettes

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { getFavorites, isLoading } = usePaletteStore() // Changed to use getFavorites method
  const { loadPalettes } = usePaletteActions() // Changed to loadPalettes to get user's own palettes
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load user's own palettes to get favorites
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }
    loadPalettes(false, searchTerm) // Load all user's palettes, we'll filter favorites below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, searchTerm])

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

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/3 to-[#14b8a6]/3">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        favoriteCount={favoritePalettes.length} // Update count for sidebar
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                  Favorite Palettes
                </h1>
                <p className="text-sm sm:text-base text-neutral-600">
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search favorite palettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Palettes Grid */}
          {isLoading && filteredPalettes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]"></div>
            </div>
          ) : filteredPalettes.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle className="text-neutral-600">
                  {searchTerm 
                    ? 'No favorite palettes found matching your search' 
                    : 'You haven\'t marked any palettes as favorites yet'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms or clear the search'
                    : 'Create some palettes and mark them as favorites to see them here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {paginatedPalettes.map((palette) => (
                  <PaletteCard key={palette.id} palette={palette} />
                ))}
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="min-w-[80px] hover:bg-[#14b8a6] hover:text-white"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-neutral-700">Page {page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="min-w-[80px] hover:bg-[#14b8a6] hover:text-white"
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

