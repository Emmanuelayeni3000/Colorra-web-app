import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Heart, Filter, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaletteStore } from '@/store/paletteStore'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import Sidebar from '@/components/layout/Sidebar'
import PaletteCard from '@/components/palette/PaletteCard'
import CreatePaletteModal from '@/components/palette/CreatePaletteModal'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { palettes, getFavorites, isLoading } = usePaletteStore()
  const { loadPalettes } = usePaletteActions()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Only run once on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
    } else {
      loadPalettes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter palettes based on search and filter
  const filteredPalettes = palettes.filter(palette => {
    const matchesSearch = palette.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (palette.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesFilter = filter === 'all' || (filter === 'favorites' && palette.isFavorite)
    return matchesSearch && matchesFilter
  })

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 20
  const totalPages = Math.ceil(filteredPalettes.length / pageSize)
  const paginatedPalettes = filteredPalettes.slice((page - 1) * pageSize, page * pageSize)

  const favoriteCount = getFavorites().length

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-neutral-50">
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
        favoriteCount={favoriteCount}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-neutral-900">
                  {filter === 'favorites' ? 'Favorite Palettes' : 'My Palettes'}
                </h1>
                <p className="text-neutral-600">
                  {filteredPalettes.length} palette{filteredPalettes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-primary text-white hover:bg-[#14b8a6] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Palette
            </Button>
          </div>
        </header>

        {/* Controls */}
        <div className="px-4 py-6 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search palettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={`min-w-[80px] ${filter !== 'all' ? 'hover:bg-[#14b8a6] hover:text-white' : 'text-white'}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                All
              </Button>
              <Button
                variant={filter === 'favorites' ? 'default' : 'outline'}
                onClick={() => setFilter('favorites')}
                className={`min-w-[100px] ${filter !== 'favorites' ? 'hover:bg-[#14b8a6] hover:text-white' : 'text-white'}`}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites ({favoriteCount})
              </Button>
            </div>
          </div>

          {/* Palettes Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPalettes.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle className="text-neutral-600">
                  {searchTerm || filter === 'favorites' 
                    ? 'No palettes found' 
                    : 'No palettes yet'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : filter === 'favorites'
                    ? 'You haven\'t favorited any palettes yet'
                    : 'Create your first palette to get started'
                  }
                </p>
                {!searchTerm && filter !== 'favorites' && (
                  <Button 
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-primary text-white hover:bg-[#14b8a6] hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Palette
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Create Palette Modal */}
      <CreatePaletteModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={loadPalettes}
      />
    </div>
  )
}

// Protect this page
DashboardPage.requireAuth = true
