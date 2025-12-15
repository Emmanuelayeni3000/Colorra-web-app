import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  LogOut, 
  User, 
  LayoutDashboard, 
  ChevronDown, 
  Palette as PaletteIcon, 
  TrendingUp,
  Eye,
  Sparkles,
  Star,
  X,
  Bookmark
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaletteStore } from '@/store/paletteStore'
import { Palette } from '@/store/paletteStore'
import PublicPaletteCard from '@/components/palette/PublicPaletteCard'
import { apiClient } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SEO, { pageSEO } from '@/components/SEO'

const categories = [
  { name: "Warm", colors: ["#FF6B6B", "#FF8E53", "#FFD93D"], description: "Cozy and energetic", icon: "🔥" },
  { name: "Cool", colors: ["#6BCF7F", "#4D96FF", "#9B59B6"], description: "Calm and refreshing", icon: "❄️" },
  { name: "Earth Tones", colors: ["#8B4513", "#CD853F", "#A0522D"], description: "Natural and grounded", icon: "🌿" },
  { name: "Pastel", colors: ["#FFB3BA", "#BAFFC9", "#BAE1FF"], description: "Soft and gentle", icon: "🌸" },
  { name: "Neutral", colors: ["#F5F5DC", "#D3D3D3", "#A9A9A9"], description: "Clean and minimal", icon: "⚪" },
  { name: "Vibrant/High Contrast", colors: ["#FF1744", "#00E676", "#2196F3"], description: "Bold and striking", icon: "⚡" },
  { name: "Minimal", colors: ["#FFFFFF", "#000000", "#808080"], description: "Pure and simple", icon: "◾" }
];


export default function ExplorePage() {
  const router = useRouter()
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore()
  const { publicPalettes, setPublicPalettes, isLoading, setLoading } = usePaletteStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [paletteOfTheDay, setPaletteOfTheDay] = useState<Palette | null>(null);
  const [stats, setStats] = useState<{ totalPalettes: number; totalBookmarks: number; monthlyViews: number } | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/signin?redirect=/explore')
    }
  }, [hasHydrated, isAuthenticated, router])

  useEffect(() => {
    const fetchPublicPalettesAndPaletteOfTheDay = async () => {
      try {
        setLoading(true)
        const [palettes, dailyPalette, statsData] = await Promise.all([
          apiClient.getPublicPalettes(category === 'all' ? '' : category),
          apiClient.getPaletteOfTheDay().catch(error => {
            console.error("Failed to fetch Palette of the Day:", error);
            return null;
          }),
          apiClient.getExploreStats().catch(error => {
            console.error("Failed to fetch stats:", error);
            return null;
          })
        ]);
        setPublicPalettes(palettes);
        if (statsData) setStats(statsData);
        setPaletteOfTheDay(dailyPalette);
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (hasHydrated && isAuthenticated) {
      fetchPublicPalettesAndPaletteOfTheDay()
    }
  }, [setLoading, setPublicPalettes, category, hasHydrated, isAuthenticated])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const filteredPalettes = publicPalettes.filter(palette =>
    palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/30 to-teal-50/30">
      <SEO {...pageSEO.explore} />
      
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/20 shadow-glass">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={90} height={70} className="sm:w-[100px]" />
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Avatar className="h-8 w-8 ring-2 ring-white/50 shadow-sm">
                <AvatarImage 
                  src={user?.avatarUrl ? (
                    user.avatarUrl.startsWith('http') 
                      ? user.avatarUrl 
                      : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatarUrl}?t=${Date.now()}`
                  ) : ''} 
                  alt={user?.name || 'User'} 
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white text-sm font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/50">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-elevated" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-lg">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-lg">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section - Enhanced */}
        <div className="relative overflow-hidden">
          {/* Animated background blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/3"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center">
              {/* Title with icons */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 animate-pulse" />
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-teal-500 bg-clip-text text-transparent">
                  Explore Palettes
                </h1>
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-teal-500 animate-pulse" />
              </div>
              <p className="text-base sm:text-lg md:text-xl text-neutral-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
                Discover stunning color palettes crafted by our creative community
              </p>
              
              {/* Stats Cards - Responsive Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
                <Card className="bg-white/70 backdrop-blur-sm border-purple-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl sm:rounded-2xl">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <PaletteIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">{publicPalettes.length}</p>
                    <p className="text-xs sm:text-sm text-neutral-500">Palettes</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 backdrop-blur-sm border-pink-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl sm:rounded-2xl">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-pink-600">
                      {stats ? (stats.monthlyViews >= 1000 ? `${(stats.monthlyViews / 1000).toFixed(1)}k` : stats.monthlyViews) : '...'}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-500">Activity</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 backdrop-blur-sm border-amber-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl sm:rounded-2xl">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                      {stats?.totalBookmarks || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-500">Bookmarks</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Palette of the Day Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-full shadow-lg shadow-purple-500/25">
              <Star className="h-4 w-4" />
              <span>Featured Today</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-3">Palette of the Day</h2>
            <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto">
              {paletteOfTheDay ? 'Handpicked by our design algorithm' : 'No featured palette yet — create one to get featured!'}
            </p>
          </div>
          
          {paletteOfTheDay ? (
            <div className="flex justify-center">
              <div className="w-full max-w-md transform hover:scale-[1.02] transition-transform duration-300">
                <PublicPaletteCard palette={paletteOfTheDay} readonly={true} />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-lg">
              <div className="relative rounded-2xl border-2 border-dashed border-purple-200 bg-white/60 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-teal-500/5" />
                <div className="relative space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto">
                    <PaletteIcon className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-neutral-700 text-base sm:text-lg font-semibold">Be the first to get featured</p>
                  <p className="text-neutral-500 text-sm">
                    Share a public palette and our algorithm might pick yours!
                  </p>
                  <div className="flex gap-2 justify-center pt-2">
                    {['#8b5cf6','#ec4899','#14b8a6','#fbbf24','#6366f1'].map(c => (
                      <div key={c} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-sm ring-2 ring-white/60" style={{background:c}} />
                    ))}
                  </div>
                  <Link href="/dashboard">
                    <Button className="btn-gradient text-white rounded-xl shadow-lg shadow-purple-500/25 mt-2">
                      Create a Palette
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Section - Enhanced */}
        <div className="bg-white/40 backdrop-blur-sm py-12 sm:py-16 border-y border-neutral-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-3">Explore by Category</h2>
              <p className="text-sm sm:text-base text-neutral-600">Find palettes that match your style</p>
            </div>
            
            {/* Category Pills - Scrollable on mobile */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
              <button
                onClick={() => setCategory('all')}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-white/80 text-neutral-700 hover:bg-white hover:shadow-md border border-neutral-200'
                }`}
              >
                All Palettes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    category === cat.name 
                      ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white shadow-lg shadow-purple-500/25' 
                      : 'bg-white/80 text-neutral-700 hover:bg-white hover:shadow-md border border-neutral-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                  <span className="sm:hidden">{cat.name.split('/')[0]}</span>
                </button>
              ))}
            </div>
            
            {/* Category Cards - Only show when "all" is selected */}
            {category === 'all' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {categories.map((cat) => (
                  <Card 
                    key={cat.name} 
                    className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-neutral-200/50 rounded-xl sm:rounded-2xl group"
                    onClick={() => setCategory(cat.name)}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center space-x-1.5 sm:space-x-2 mb-3">
                        {cat.colors.map((color, index) => (
                          <div 
                            key={index}
                            className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{cat.icon}</span>
                        <h3 className="font-semibold text-sm sm:text-base text-neutral-800">{cat.name.split('/')[0]}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1 hidden sm:block">{cat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Section - Enhanced */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-neutral-200/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    placeholder="Search palettes by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-11 sm:h-12 rounded-xl border-neutral-200 focus:border-purple-300 focus:ring-purple-500/20"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className="h-11 sm:h-12 w-full sm:w-[180px] rounded-xl border-neutral-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name} className="rounded-lg">
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="hidden sm:flex items-center px-4 py-2 bg-purple-50 rounded-xl">
                  <p className="text-sm text-neutral-600">
                    <span className="font-bold text-purple-600">{filteredPalettes.length}</span> results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Palettes Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          {isLoading ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
                  </div>
                  <span className="text-neutral-600 font-medium">Loading palettes...</span>
                </div>
              </div>
              
              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="h-32 sm:h-40 bg-neutral-200"></div>
                    <CardContent className="p-3 sm:p-4">
                      <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : filteredPalettes.length === 0 ? (
            <Card className="text-center py-12 sm:py-16 bg-white/60 backdrop-blur-sm border-neutral-200/50 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-neutral-400" />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-neutral-700 mb-3">
                  {searchTerm || (category && category !== 'all')
                    ? 'No palettes found' 
                    : 'No public palettes yet'
                  }
                </CardTitle>
                <p className="text-sm sm:text-base text-neutral-500 mb-6 max-w-md mx-auto">
                  {searchTerm || (category && category !== 'all')
                    ? 'Try adjusting your search or explore different categories'
                    : 'Be the first to share a beautiful color palette!'
                  }
                </p>
                {(searchTerm || (category && category !== 'all')) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('')
                      setCategory('all')
                    }}
                    className="btn-gradient text-white rounded-xl"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-800">
                  {category === 'all' ? 'All Palettes' : `${category} Palettes`}
                </h3>
                <p className="text-sm text-neutral-500">
                  Showing {filteredPalettes.length} {filteredPalettes.length === 1 ? 'palette' : 'palettes'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredPalettes.map((palette) => (
                  <PublicPaletteCard key={palette.id} palette={palette} readonly={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
