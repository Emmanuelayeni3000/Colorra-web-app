import React, { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileDown,
  Clipboard,
  Heart,
  Share2
} from 'lucide-react' 
import { Palette } from '@/store/paletteStore'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import { exportPaletteAsJSON, exportPaletteAsCSS, exportPaletteAsSCSS, exportPaletteAsPNG, copyPaletteToClipboard } from '@/lib/paletteExport'
import { cn, getContrastingTextColor } from '@/lib/utils'
import { toast } from 'sonner'
import EditPaletteModal from './EditPaletteModal'
import SharePaletteModal from './SharePaletteModal'

interface PaletteCardProps {
  palette: Palette;
  isReadOnly?: boolean;
}

interface DropdownMenuProps {
  onClose: () => void;
  targetRef: React.RefObject<HTMLButtonElement>;
  onCopy: (e: React.MouseEvent) => void;
  onExport: (format: 'json' | 'css' | 'scss') => (e: React.MouseEvent) => void;
  onExportPNG: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  isReadOnly?: boolean;
}

function DropdownMenu({
  onClose,
  targetRef,
  onCopy,
  onExport,
  onExportPNG,
  onDelete,
  onEdit,
  onShare,
  isReadOnly
}: DropdownMenuProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (targetRef.current && dropdownRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect()
      const dropdownRect = dropdownRef.current.getBoundingClientRect()
      
      let top = targetRect.bottom + window.scrollY + 8
      let left = targetRect.right + window.scrollX - dropdownRect.width
      
      // Adjust if dropdown would go off screen
      if (left < 8) {
        left = targetRect.left + window.scrollX
      }
      
      
      
      setPosition({ top, left })
    }
  }, [targetRef])

  useLayoutEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return createPortal(
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{ top: position.top, left: position.left }}
    >
      {!isReadOnly && (
        <>
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Palette
          </button>
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Palette
          </button>
        </>
      )}
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={onCopy}
      >
        <Clipboard className="h-4 w-4 mr-2" />
        Copy Colors
      </button>
      <div className="border-t border-neutral-200 my-1"></div>
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
      {!isReadOnly && (
        <>
          <div className="border-t border-neutral-200 my-1"></div>
          <button
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Palette
          </button>
        </>
      )}
    </div>,
    document.body
  )
}

export default function PaletteCard({ palette, isReadOnly }: PaletteCardProps) {
  const { toggleFavorite, deletePalette, togglePublic } = usePaletteActions()
  const [showActions, setShowActions] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // New state for share modal
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(palette.id)
    } catch {
      // Error handling is done in the hook
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    setIsShareModalOpen(true);
  };

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast("Are you sure you want to delete this palette?", {
      action: {
        label: "Delete",
        onClick: () => deletePalette(palette.id),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    setIsEditModalOpen(true);
  };

  const handleExportPNG = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    try {
      exportPaletteAsPNG(palette);
      toast.success('Palette exported as PNG!');
    } catch {
      toast.error('Failed to export palette as PNG');
    }
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color} to clipboard!`);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl">
      <div className="flex h-40">
        {palette.colors.map((color, index) => (
          <div
            key={index}
            className="relative flex-1 group/swatch transition-all duration-300 ease-in-out hover:flex-grow-[1.5] cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => handleCopyColor(color)}
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
        <span className="text-sm font-medium text-neutral-800">{palette.name}</span>
        <div className="flex items-center space-x-1">
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[#14b8a6] hover:text-white"
              title={palette.isPublic ? 'Make Private' : 'Make Public'}
              onClick={(e) => {
                e.stopPropagation()
                togglePublic(palette.id, palette.isPublic)
              }}
            >
              {/* Simple icon indicator: filled circle if public, outline if private */}
              <span
                className={cn(
                  'h-3 w-3 rounded-full border',
                  palette.isPublic ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-400'
                )}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-[#14b8a6] hover:text-white"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                palette.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-neutral-400"
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
                e.stopPropagation()
                setShowActions(!showActions)
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
                onDelete={handleDelete}
                onEdit={handleEdit}
                onShare={handleShare} // Pass the new handleShare function
                isReadOnly={isReadOnly}
              />
            )}
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <EditPaletteModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          palette={palette}
          onUpdated={() => {
            // Optionally refresh palettes or show a success message
            toast.success('Palette updated successfully!');
          }}
        />
      )}
      {isShareModalOpen && (
        <SharePaletteModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          paletteId={palette.id}
        />
      )}
    </div>
  )
}

