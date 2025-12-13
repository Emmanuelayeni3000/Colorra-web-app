import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Copy, 
  Download,
  CopyPlus
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePaletteActions } from '@/hooks/usePaletteActions';
import { apiClient } from '@/lib/api';
import { Palette } from '@/store/paletteStore';
import { getContrastingTextColor, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { exportPaletteAsJSON, exportPaletteAsCSS, exportPaletteAsSCSS, exportPaletteAsSVG, copyPaletteToClipboard } from '@/lib/paletteExport';
import { format } from 'date-fns';
import CommentsSection from '@/components/palette/CommentsSection';
import colorBlind from 'color-blind';
import * as wcagContrast from 'wcag-contrast';

export default function PaletteDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuthStore();
  const { toggleBookmark } = usePaletteActions();

  const [palette, setPalette] = useState<Palette | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlindnessType, setSelectedBlindnessType] = useState<string>('normal');

  // Smart back navigation - falls back to /explore if no history
  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/explore');
    }
  };

  const colorBlindnessTypes = [
    { value: 'normal', label: 'Normal Vision' },
    { value: 'protanomaly', label: 'Protanomaly (Red-Weak)' },
    { value: 'deuteranomaly', label: 'Deuteranomaly (Green-Weak)' },
    { value: 'tritanomaly', label: 'Tritanomaly (Blue-Weak)' },
    { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
    { value: 'achromatopsia', label: 'Achromatopsia (Total Color Blindness)' },
    { value: 'achromatomaly', label: 'Achromatomaly (Partial Color Blindness)' },
  ];

  useEffect(() => {
    if (!id) return;

    const fetchPalette = async () => {
      try {
        setIsLoading(true);
        const fetchedPalette = await apiClient.getPublicPaletteById(id as string);
        setPalette(fetchedPalette);
      } catch (err) {
        console.error('Failed to fetch palette:', err);
        setError('Failed to load palette. It might not exist or is private.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPalette();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to bookmark palettes');
      router.push('/signin?redirect=/palettes/' + id);
      return;
    }
    if (palette) {
      try {
        await toggleBookmark(palette.id, palette.isBookmarked || false);
        setPalette(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
      } catch {
        // Error handling is done in the hook
      }
    }
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color} to clipboard!`);
  };

  const handleCopyAllColors = async () => {
    if (!palette) return;
    const success = await copyPaletteToClipboard(palette, 'hex');
    if (success) {
      toast.success('All colors copied to clipboard!');
    } else {
      toast.error('Failed to copy colors');
    }
  };

  const handleExport = (format: 'json' | 'css' | 'scss' | 'svg') => {
    if (!palette) return;
    
    try {
      switch (format) {
        case 'json':
          exportPaletteAsJSON(palette);
          toast.success('Palette exported as JSON!');
          break;
        case 'css':
          exportPaletteAsCSS(palette);
          toast.success('Palette exported as CSS!');
          break;
        case 'scss':
          exportPaletteAsSCSS(palette);
          toast.success('Palette exported as SCSS!');
          break;
        case 'svg':
          exportPaletteAsSVG(palette);
          toast.success('Palette exported as SVG!');
          break;
      }
    } catch {
      toast.error('Failed to export palette');
    }
  };

  const handleRemixPalette = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to remix palettes');
      router.push('/signin?redirect=/palettes/' + id);
      return;
    }
    
    try {
      await apiClient.remixPalette(palette!.id);
      toast.success('Palette remixed successfully! Redirecting to your dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to remix palette:', error);
      toast.error('Failed to remix palette');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: palette?.name,
        text: `Check out this beautiful color palette: ${palette?.name}`,
        url: window.location.href,
      });
    } catch {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Palette link copied to clipboard!');
    }
  };

  // Helper function to construct full avatar URL
  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`;
  };

  const getSimulatedColors = (originalColors: string[]) => {
    if (selectedBlindnessType === 'normal') {
      return originalColors;
    }
    return originalColors.map(color => {
      // color-blind library expects hex without #
      const hex = color.startsWith('#') ? color.substring(1) : color;
      // color-blind package exports functions keyed by type; index signature not in types, so cast safely
      const transformer = (colorBlind as Record<string, (hex: string) => string>)[selectedBlindnessType];
      const simulatedHex = transformer ? transformer(hex) : hex;
      return `#${simulatedHex}`;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <Button onClick={handleGoBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  if (!palette) {
    return (
                  <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading palette</h1>
          <Button variant="ghost" onClick={handleGoBack} className="hover:text-white hover:bg-teal-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    );
  }

  // Avatar helper removed (unused)

  const displayedColors = getSimulatedColors(palette.colors);

  const calculateContrasts = (colors: string[]) => {
    const contrasts: { color1: string; color2: string; ratio: number; wcag: string }[] = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const color1 = colors[i];
        const color2 = colors[j];
        const ratio = wcagContrast.hex(color1, color2);
        let wcag = 'Fail';
        if (ratio >= 7) wcag = 'AAA';
        else if (ratio >= 4.5) wcag = 'AA';
        else if (ratio >= 3) wcag = 'AA Large';
        contrasts.push({ color1, color2, ratio: parseFloat(ratio.toFixed(2)), wcag });
      }
    }
    return contrasts;
  };

  const contrasts = calculateContrasts(palette.colors);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="flex items-center gap-2 hover:text-white hover:bg-teal-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBookmark}
                className={cn(
                  palette.isBookmarked && "bg-blue-50 border-blue-200"
                )}
              >
                <Bookmark 
                  className={cn(
                    "h-4 w-4",
                    palette.isBookmarked && "fill-blue-500 text-blue-500"
                  )} 
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Enhanced Palette Display */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-64 sm:h-80 flex">
                  {displayedColors.map((color, index) => (
                    <div
                      key={index}
                      className="relative flex-1 group cursor-pointer transition-all duration-300 hover:flex-grow-[1.2]"
                      style={{ backgroundColor: color }}
                      onClick={() => handleCopyColor(color)}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                        <span
                          className="text-lg font-mono font-semibold mb-2"
                          style={{ color: getContrastingTextColor(color) }}
                        >
                          {color}
                        </span>
                        <Copy 
                          className="h-5 w-5" 
                          style={{ color: getContrastingTextColor(color) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Palette Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-bold">{palette.name}</CardTitle>
                    {palette.description && (
                      <p className="text-gray-600 max-w-2xl">{palette.description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <Link 
                        href={`/users/${palette.user?.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={getFullAvatarUrl(palette.user?.avatarUrl)} 
                            alt={palette.user?.name || 'User'} 
                          />
                          <AvatarFallback>
                            {palette.user?.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium group-hover:text-teal-600 transition-colors">
                            {palette.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created {format(new Date(palette.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                  {palette.category && (
                    <Badge variant="secondary" className="mt-1">
                      {palette.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Color Blindness Simulator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Color Blindness Simulator</CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedBlindnessType} value={selectedBlindnessType}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select Simulation Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorBlindnessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <CommentsSection paletteId={palette.id} />
              </CardContent>
            </Card>

            {/* Contrast Checker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accessibility Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contrasts.map((c, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-md border border-gray-300" style={{ backgroundColor: c.color1 }}></div>
                        <span className="text-sm font-mono text-gray-700">{c.color1}</span>
                        <span className="text-gray-400">vs</span>
                        <div className="w-8 h-8 rounded-md border border-gray-300" style={{ backgroundColor: c.color2 }}></div>
                        <span className="text-sm font-mono text-gray-700">{c.color2}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">Ratio: {c.ratio}:1</span>
                        <Badge 
                          variant={c.wcag === 'AAA' ? 'default' : c.wcag === 'AA' || c.wcag === 'AA Large' ? 'secondary' : 'destructive'}
                        >
                          WCAG: {c.wcag}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleCopyAllColors} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Colors
                </Button>
                
                <Button 
                  onClick={handleRemixPalette} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <CopyPlus className="h-4 w-4 mr-2" />
                  Remix Palette
                </Button>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">Export as:</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleExport('json')} 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button 
                      onClick={() => handleExport('css')} 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSS
                    </Button>
                    <Button 
                      onClick={() => handleExport('scss')} 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      SCSS
                    </Button>
                    <Button 
                      onClick={() => handleExport('svg')} 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      SVG
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Color Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {palette.colors.map((color, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleCopyColor(color)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-sm">{color}</span>
                      </div>
                      <Copy className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}