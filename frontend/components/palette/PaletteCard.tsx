import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2,
  Download,
  FileDown,
  Clipboard
} from 'lucide-react'
import { Palette } from '@/store/paletteStore'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import { exportPaletteAsJSON, exportPaletteAsCSS, exportPaletteAsSCSS, copyPaletteToClipboard } from '@/lib/paletteExport'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PaletteCardProps {
  palette: Palette
}

export default function PaletteCard({ palette }: PaletteCardProps) {
  const { toggleFavorite, deletePalette } = usePaletteActions()
  const [showActions, setShowActions] = useState(false)

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions) {
        const target = event.target as Element
        if (!target.closest('.relative')) {
          setShowActions(false)
        }
      }
    }
    
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleFavorite(palette.id)
    } catch (error) {
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

  const handleExport = (format: 'json' | 'css' | 'scss') => {
    return (e: React.MouseEvent) => {
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
      } catch (error) {
        toast.error('Failed to export palette')
      }
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this palette?')) {
      try {
        await deletePalette(palette.id)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-0 shadow-sm hover:shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-neutral-900 truncate">
              {palette.name}
            </CardTitle>
            {palette.description && (
              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                {palette.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#14b8a6] hover:text-white"
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 hover:text-white",
                  palette.isFavorite 
                    ? "fill-red-500 text-red-500" 
                    : "text-neutral-400 hover:text-white"
                )}
              />
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#14b8a6] hover:text-white "
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActions(false)
                      // TODO: Implement edit functionality
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Palette
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={handleCopyColors}
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy Colors
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={handleExport('json')}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as JSON
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={handleExport('css')}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as CSS
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={handleExport('scss')}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as SCSS
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Color Swatches */}
        <div className="flex rounded-lg overflow-hidden mb-4 h-20 shadow-sm">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="flex-1 relative group/swatch transition-all duration-200 hover:flex-grow"
              style={{ backgroundColor: color }}
              title={color}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {color}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Palette Info */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{palette.colors.length} colors</span>
          <span>Created {formatDate(palette.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
