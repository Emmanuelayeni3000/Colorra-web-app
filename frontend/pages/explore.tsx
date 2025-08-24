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
  Heart,
  Eye,
  Filter,
  Sparkles
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

const categories = [
  { name: "Warm", colors: ["#FF6B6B", "#FF8E53", "#FFD93D"], description: "Cozy and energetic" },
  { name: "Cool", colors: ["#6BCF7F", "#4D96FF", "#9B59B6"], description: "Calm and refreshing" },
  { name: "Earth Tones", colors: ["#8B4513", "#CD853F", "#A0522D"], description: "Natural and grounded" },
  { name: "Pastel", colors: ["#FFB3BA", "#BAFFC9", "#BAE1FF"], description: "Soft and gentle" },
  { name: "Neutral", colors: ["#F5F5DC", "#D3D3D3", "#A9A9A9"], description: "Clean and minimal" },
  { name: "Vibrant/High Contrast", colors: ["#FF1744", "#00E676", "#2196F3"], description: "Bold and striking" },
  { name: "Minimal", colors: ["#FFFFFF", "#000000", "#808080"], description: "Pure and simple" }
];

export default function ExplorePage() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { publicPalettes, setPublicPalettes, isLoading, setLoading } = usePaletteStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [paletteOfTheDay, setPaletteOfTheDay] = useState<Palette | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/explore')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchPublicPalettesAndPaletteOfTheDay = async () => {
      try {
        setLoading(true)
        const [palettes, dailyPalette] = await Promise.all([
          apiClient.getPublicPalettes(category === 'all' ? '' : category),
          apiClient.getPaletteOfTheDay().catch(error => {
            console.error("Failed to fetch Palette of the Day:", error);
            return null; // Return null if fetching fails
          })
        ]);
        setPublicPalettes(palettes);
        setPaletteOfTheDay(dailyPalette);
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) {
      fetchPublicPalettesAndPaletteOfTheDay()
    }
  }, [setLoading, setPublicPalettes, category, isAuthenticated])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const filteredPalettes = publicPalettes.filter(palette =>
    palette.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/10 to-[#14b8a6]/10">
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[200%] bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-transparent -z-10 opacity-50 blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={100} height={80} />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatarUrl ? (
                      user.avatarUrl.startsWith('http') 
                        ? user.avatarUrl 
                        : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatarUrl}?t=${Date.now()}`
                    ) : ''} 
                    alt={user?.name || 'User'} 
                  />
                  <AvatarFallback>{user?.name?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-600/10 via-pink-500/10 to-teal-500/10">
          <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 bg-clip-text text-transparent">
                  Explore Palettes
                </h1>
                <Sparkles className="h-8 w-8 text-teal-600" />
              </div>
              <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                Discover stunning color palettes crafted by our creative community. Find inspiration, share your creations, and bring your projects to life.
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <PaletteIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-600">{publicPalettes.length}</p>
                    <p className="text-sm text-neutral-600">Color Palettes</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-pink-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-pink-600">2.5k</p>
                    <p className="text-sm text-neutral-600">Monthly Views</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-teal-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-teal-600">850</p>
                    <p className="text-sm text-neutral-600">Favorites</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Palette of the Day Section (with fallback) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4 px-6 py-2 text-sm font-medium rounded-full inline-flex items-center">
              Featured Today
            </div>
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">Palette of the Day</h2>
            <p className="text-lg text-neutral-600">
              {paletteOfTheDay ? 'Handpicked by our design team' : 'No featured palette yet — create and publish one to get featured!'}
            </p>
          </div>
          {paletteOfTheDay ? (
            <div className="flex justify-center">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <PublicPaletteCard palette={paletteOfTheDay} readonly={true} />
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl">
              <div className="relative rounded-2xl border border-dashed border-purple-300 bg-white/70 backdrop-blur-sm p-8 shadow-sm">
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-teal-500/5" />
                <div className="relative space-y-4">
                  <p className="text-neutral-700 text-lg font-medium">Be the first to get featured today</p>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Share a public palette. Our smart selection algorithm highlights engaging, recent palettes each day.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {['#8b5cf6','#ec4899','#14b8a6','#fbbf24','#6366f1'].map(c => (
                      <div key={c} className="w-12 h-12 rounded-md shadow-sm ring-1 ring-white/60" style={{background:c}} />
                    ))}
                  </div>
                  <div className="pt-4 flex justify-center">
                    <Link href="/dashboard">
                      <Button className="bg-purple-600 text-white hover:bg-purple-700">Create a Palette</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-neutral-50/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-800 mb-4">Explore by Category</h2>
              <p className="text-lg text-neutral-600">Find palettes that match your style</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {categories.map((cat) => (
                <Card 
                  key={cat.name} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    category === cat.name ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-white'
                  }`}
                  onClick={() => setCategory(cat.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      {cat.colors.map((color, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">{cat.name}</h3>
                    <p className="text-sm text-neutral-600">{cat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reset Category Button */}
            {category !== 'all' && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setCategory('all')}
                  className="hover:bg-purple-50 hover:border-purple-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Show All Categories
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 w-full lg:max-w-md">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Search Palettes
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input
                    placeholder="Search by name, color, or creator..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 border-neutral-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 w-full lg:max-w-xs">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Filter by Category
                </label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className="h-12 border-neutral-300 focus:border-purple-500">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-2">Results</p>
                <p className="text-2xl font-bold text-purple-600">{filteredPalettes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Palettes Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {isLoading ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="text-lg text-neutral-600">Loading amazing palettes...</span>
                </div>
              </div>
              
              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-40 bg-neutral-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : filteredPalettes.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-to-br from-neutral-50 to-purple-50 border-purple-200">
              <CardContent className="p-8">
                <Eye className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-neutral-700 mb-4">
                  {searchTerm || (category && category !== 'all')
                    ? 'No palettes found matching your criteria' 
                    : 'No public palettes available yet'
                  }
                </CardTitle>
                <p className="text-neutral-600 mb-6">
                  {searchTerm || (category && category !== 'all')
                    ? 'Try adjusting your search terms or explore different categories'
                    : 'Be the first to share a beautiful color palette with the community!'
                  }
                </p>
                {(searchTerm || (category && category !== 'all')) && (
                  <Button 
                    onClick={() => {
                      setSearchTerm('')
                      setCategory('all')
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-neutral-800">
                  {category === 'all' ? 'All Palettes' : `${category} Palettes`}
                  <span className="text-lg font-normal text-neutral-600 ml-2">
                    ({filteredPalettes.length} {filteredPalettes.length === 1 ? 'palette' : 'palettes'})
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPalettes.map((palette) => (
                  <div key={palette.id} className="transform hover:scale-105 transition-transform duration-300">
                    <PublicPaletteCard palette={palette} readonly={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
