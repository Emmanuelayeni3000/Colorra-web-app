import React, { useState, useRef, useLayoutEffect } from 'react'
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
import { exportPaletteAsJSON, exportPaletteAsCSS, exportPaletteAsSCSS, exportPaletteAsPNG, copyPaletteToClipboard } from '@/lib/paletteExport'
import { cn, getContrastingTextColor } from '@/lib/utils'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiClient } from '@/lib/api'

interface PublicPaletteCardProps {
  palette: Palette & { user?: { name?: string | null, avatarUrl?: string | null } };
  readonly?: boolean; // Added readonly prop
}

interface DropdownMenuProps {
  onClose: () => void;
  targetRef: React.RefObject<HTMLButtonElement>;
  onCopy: (e: React.MouseEvent) => void;
  onExport: (format: 'json' | 'css' | 'scss') => (e: React.MouseEvent) => void;
  onExportPNG: (e: React.MouseEvent) => void;
  onRemix: (e: React.MouseEvent) => void;
}

function DropdownMenu({ onClose, targetRef, onCopy, onExport, onExportPNG, onRemix }: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const updatePosition = () => {
      if (targetRef.current && dropdownRef.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        
        let top = targetRect.bottom + window.scrollY + 4; // 4px gap
        let left = targetRect.left + window.scrollX;

        // Adjust if dropdown goes off-screen (use estimated width if not available)
        const dropdownWidth = dropdownRef.current.offsetWidth || 192; // 192px = w-48
        const dropdownHeight = dropdownRef.current.offsetHeight || 200; // estimated height
        
        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 8;
        }
        
        
        setPosition({ top, left });
      }
    };

    // Update position immediately and after a brief delay to handle rendering
    updatePosition();
    const timeoutId = setTimeout(updatePosition, 0);
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timeoutId);
    };
  }, [targetRef, onClose]);

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onCopy}
      >
        <Clipboard className="h-4 w-4 mr-2" />
        Copy Colors
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onRemix}
      >
        <CopyPlus className="h-4 w-4 mr-2" />
        Remix Palette
      </button>
      <div className="border-t border-gray-100 my-1"></div>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onExport('json')}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as JSON
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onExport('css')}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as CSS
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onExport('scss')}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as SCSS
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onExportPNG}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export as PNG
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

  // Use current user info if this palette belongs to the logged-in user
  const displayUser = currentUser && palette.user?.id === currentUser.id 
    ? { name: currentUser.name, avatarUrl: currentUser.avatarUrl }
    : palette.user

  // Helper function to construct full avatar URL
  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return ''
    if (avatarUrl.startsWith('http')) return avatarUrl
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const baseUrl = apiUrl.replace('/api', '')
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`
  }

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (readonly) return; // Prevent action if readonly
    
    // Check if user is authenticated
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
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return
    }
    router.push(`/palettes/${palette.id}`)
  }

  return (
    <div 
      className="relative group rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl cursor-pointer"
      onClick={handleCardClick}
    >
        <div className="flex h-40">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="relative flex-1 group/swatch transition-all duration-300 ease-in-out hover:flex-grow-[1.5] cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when copying color
                handleCopyColor(color);
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-300">
                <span
                  className="text-sm font-sans uppercase"
                  style={{ color: getContrastingTextColor(color) }}
                >
                  {color}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center bg-white rounded-b-lg">
          <div className="flex items-center space-x-2">
            {palette.user?.id && (
              <div className="flex items-center space-x-2">
                <Link href={`/users/${palette.user.id}`} className="flex items-center space-x-2 group">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={getFullAvatarUrl(displayUser?.avatarUrl)} alt={displayUser?.name || 'User'} />
                    <AvatarFallback>{displayUser?.name?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex flex-col">
                  <Link 
                    href={`/palettes/${palette.id}`} 
                    className="text-sm font-medium text-neutral-800 hover:text-teal-600 hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {palette.name}
                  </Link>
                  <Link 
                    href={`/users/${palette.user.id}`} 
                    className="text-xs text-neutral-500 hover:text-neutral-700 hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    By {displayUser?.name || 'Anonymous'}
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-[#14b8a6] hover:text-white"
                onClick={handleToggleBookmark}
                disabled={readonly}
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4",
                    palette.isBookmarked
                      ? "fill-blue-500 text-blue-500"
                      : "text-neutral-400",
                    readonly && "cursor-not-allowed"
                  )}
                />
              </Button>
              <div className="relative">
                <Button
                  ref={moreButtonRef}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-[#14b8a6] hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when opening dropdown
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
                    onRemix={handleRemixPalette}
                  />
                )}
              </div>
            </div>
        </div>
      </div>
    )
  }
