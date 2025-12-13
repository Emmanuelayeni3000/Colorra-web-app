import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  FileDown,
  Clipboard,
  Bookmark,
  CopyPlus
} from 'lucide-react' 
import { Palette } from '@/store/paletteStore'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import { useAuthStore } from '@/store/authStore'
import { exportPaletteAsJSON, exportPaletteAsCSS, exportPaletteAsSCSS, exportPaletteAsPNG, exportPaletteAsSVG, copyPaletteToClipboard } from '@/lib/paletteExport'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiClient } from '@/lib/api'

interface PublicPaletteCardProps {
  palette: Palette & { 
    user?: { name?: string | null, avatarUrl?: string | null };
    bookmarkCount?: number;
  };
  readonly?: boolean;
}

interface DropdownMenuProps {
  onClose: () => void;
  targetRef: React.RefObject<HTMLButtonElement | null>;
  onCopy: (e: React.MouseEvent) => void;
  onExport: (format: 'json' | 'css' | 'scss') => (e: React.MouseEvent) => void;
  onExportPNG: (e: React.MouseEvent) => void;
  onExportSVG: (e: React.MouseEvent) => void;
  onRemix: (e: React.MouseEvent) => void;
}

function DropdownMenu({ onClose, targetRef, onCopy, onExport, onExportPNG, onExportSVG, onRemix }: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    
    const target = targetRef.current;
    if (!target) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const updatePosition = () => {
      if (target && dropdownRef.current) {
        const targetRect = target.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current.offsetHeight || 200;
        const dropdownWidth = dropdownRef.current.offsetWidth || 192;
        
        let top = targetRect.bottom + 4;
        let left = targetRect.left;

        if (top + dropdownHeight > window.innerHeight) {
          top = targetRect.top - dropdownHeight - 4;
        }

        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 8;
        }

        if (left < 8) {
          left = 8;
        }
        
        setPosition({ top, left });
      }
    };

    updatePosition();
    const timeoutId = setTimeout(updatePosition, 10);
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timeoutId);
    };
  }, [targetRef, onClose, mounted]);

  if (!mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-elevated border border-neutral-200/50 py-1.5 z-[9999] animate-scale-in"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onCopy}
      >
        <Clipboard className="h-4 w-4 mr-2" />
        Copy Colors
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-purple-50 hover:text-purple-600 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onRemix}
      >
        <CopyPlus className="h-4 w-4 mr-2" />
        Remix Palette
      </button>
      <div className="border-t border-neutral-100 my-1.5"></div>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onExport('json')}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as JSON
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onExport('css')}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as CSS
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onExport('scss')}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as SCSS
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onExportPNG}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as PNG
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-smooth rounded-lg mx-1 mr-2"
        onClick={onExportSVG}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as SVG
      </button>
    </div>,
    document.body
  );
}


export default function PublicPaletteCard({ palette, readonly }: PublicPaletteCardProps) {
  const router = useRouter()
  const { isAuthenticated, user: currentUser } = useAuthStore()
  const { toggleBookmark } = usePaletteActions()
  const [showActions, setShowActions] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const displayUser = currentUser && palette.user?.id === currentUser.id 
    ? { name: currentUser.name, avatarUrl: currentUser.avatarUrl }
    : palette.user

  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return ''
    if (avatarUrl.startsWith('http')) return avatarUrl
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const baseUrl = apiUrl.replace('/api', '')
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`
  }

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (readonly) return;
    
    if (!isAuthenticated) {
      toast.info('Please sign in to bookmark palettes')
      router.push('/signin?redirect=/explore')
      return
    }
    
    try {
      await toggleBookmark(palette.id, palette.isBookmarked || false)
    } catch {
      // Error handling is done in the hook
    }
  }

  const handleCopyColors = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(false)
    const success = await copyPaletteToClipboard(palette, 'hex')
    if (success) {
      toast.success('Colors copied to clipboard!')
    } else {
      toast.error('Failed to copy colors')
    }
  }

  const handleExport = (format: 'json' | 'css' | 'scss') => (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(false)
    
    try {
      switch (format) {
        case 'json':
          exportPaletteAsJSON(palette)
          toast.success('Palette exported as JSON!')
          break
        case 'css':
          exportPaletteAsCSS(palette)
          toast.success('Palette exported as CSS!')
          break
        case 'scss':
          exportPaletteAsSCSS(palette)
          toast.success('Palette exported as SCSS!')
          break
      }
    } catch {
      toast.error('Failed to export palette')
    }
  }

  const handleExportPNG = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    try {
      exportPaletteAsPNG(palette);
      toast.success('Palette exported as PNG!');
    } catch {
      toast.error('Failed to export palette as PNG');
    }
  }

  const handleExportSVG = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    try {
      exportPaletteAsSVG(palette);
      toast.success('Palette exported as SVG!');
    } catch {
      toast.error('Failed to export palette as SVG');
    }
  }

  const handleRemixPalette = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    if (!isAuthenticated) {
      toast.info('Please sign in to remix palettes.');
      router.push('/signin?redirect=/palettes/' + palette.id);
      return;
    }
    try {
      await apiClient.remixPalette(palette.id);
      toast.success('Palette remixed successfully! Redirecting to your dashboard...');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Failed to remix palette:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to remix palette.';
      toast.error(errorMessage);
    }
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color)
    toast.success(`Copied ${color} to clipboard!`)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return
    }
    router.push(`/palettes/${palette.id}`)
  }

  return (
    <div 
      className="relative group rounded-2xl overflow-hidden bg-white shadow-lg border border-neutral-100/50 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Color Swatches */}
      <div className="flex h-36">
        {palette.colors.map((color, index) => (
          <div
            key={index}
            className="relative flex-1 group/swatch transition-all duration-300 ease-in-out hover:flex-grow-[1.5] cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyColor(color);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-all duration-300 bg-black/10 backdrop-blur-[2px]">
              <span
                className="text-xs font-mono font-semibold uppercase px-2 py-1 rounded-lg bg-white/90 shadow-sm"
                style={{ color: color }}
              >
                {color}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Card Footer */}
      <div className="p-3 flex justify-between items-center bg-white border-t border-neutral-100/50">
        <div className="flex items-center space-x-2 min-w-0">
          {palette.user?.id && (
            <div className="flex items-center space-x-2 min-w-0">
              <Link href={`/users/${palette.user.id}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm">
                  <AvatarImage src={getFullAvatarUrl(displayUser?.avatarUrl)} alt={displayUser?.name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white text-xs font-semibold">
                    {displayUser?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col min-w-0">
                <Link 
                  href={`/palettes/${palette.id}`} 
                  className="text-sm font-semibold text-neutral-800 hover:text-purple-600 transition-colors truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {palette.name}
                </Link>
                <Link 
                  href={`/users/${palette.user.id}`} 
                  className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  by {displayUser?.name || 'Anonymous'}
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 rounded-lg transition-smooth flex items-center gap-1",
              palette.isBookmarked 
                ? "text-amber-500 hover:bg-amber-50" 
                : "text-neutral-400 hover:bg-neutral-100",
              readonly && "cursor-not-allowed opacity-50"
            )}
            onClick={handleToggleBookmark}
            disabled={readonly}
          >
            <Bookmark
              className={cn(
                "h-4 w-4 transition-smooth",
                palette.isBookmarked && "fill-current"
              )}
            />
            {palette.bookmarkCount !== undefined && palette.bookmarkCount > 0 && (
              <span className={cn(
                "text-xs font-medium",
                palette.isBookmarked ? "text-amber-500" : "text-neutral-500"
              )}>
                {palette.bookmarkCount}
              </span>
            )}
          </Button>
          <div className="relative">
            <Button
              ref={moreButtonRef}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-smooth"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showActions && (
              <DropdownMenu
                onClose={() => setShowActions(false)}
                targetRef={moreButtonRef}
                onCopy={handleCopyColors}
                onExport={handleExport}
                onExportPNG={handleExportPNG}
                onExportSVG={handleExportSVG}
                onRemix={handleRemixPalette}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
