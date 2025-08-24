import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Palette as PaletteIcon } from 'lucide-react'
import { ChromePicker } from 'react-color'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import { usePaletteStore, Palette } from '@/store/paletteStore'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditPaletteModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated?: () => void
  palette: Palette | null
}

const categories = ["Warm", "Cool", "Earth Tones", "Pastel", "Neutral", "Vibrant/High Contrast", "Minimal"];

export default function EditPaletteModal({ isOpen, onClose, onUpdated, palette }: EditPaletteModalProps) {
  const { editPalette } = usePaletteActions()
  const { isUpdating } = usePaletteStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [colors, setColors] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [category, setCategory] = useState<string>('')
  const [activeColorIndex, setActiveColorIndex] = useState(0)
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    if (palette) {
      setName(palette.name)
      setDescription(palette.description || '')
      setColors(palette.colors)
      setIsPublic(palette.isPublic || false)
      setCategory(palette.category || '')
    }
  }, [palette])

  const handleColorChange = (color: { hex: string }) => {
    const newColors = [...colors]
    newColors[activeColorIndex] = color.hex
    setColors(newColors)
  }

  const addColor = () => {
    if (colors.length < 10) {
      setColors([...colors, '#7F56D9'])
    }
  }

  const removeColor = (index: number) => {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index)
      setColors(newColors)
      if (activeColorIndex >= newColors.length) {
        setActiveColorIndex(Math.max(0, newColors.length - 1))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || colors.length === 0 || !palette) {
      return
    }

    try {
      await editPalette(palette.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        colors,
        isPublic,
        category,
      })

      if (onUpdated) onUpdated()
      onClose()
    } catch {
      // Error handling is done in the hook
    }
  }

  if (!isOpen || !palette) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-2xl font-bold text-neutral-900">
              Edit Palette
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}
            className='hover:bg-[#14b8a6] hover:text-white'
            >
              <X className="h-6 w-6 text" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Palette Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                  Palette Name *
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter palette name"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-neutral-700">
                  Description
                </label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-neutral-700">
                  Category
                </label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Make Public */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-neutral-700"
                >
                  Make this palette public
                </label>
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700">
                    Colors ({colors.length}/10)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColor}
                    disabled={colors.length >= 10}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Color
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {colors.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className={cn(
                          "w-full h-16 rounded-lg border-2 cursor-pointer transition-all",
                          activeColorIndex === index
                            ? "border-[#8b5cf6] shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setActiveColorIndex(index)
                          setShowColorPicker(true)
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-600">
                          {color}
                        </span>
                        {colors.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColor(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {showColorPicker && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-neutral-700">
                        Color Picker
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowColorPicker(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-center bg-white p-4 rounded-lg border">
                      <ChromePicker
                        color={colors[activeColorIndex]}
                        onChange={handleColorChange}
                        disableAlpha
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || !name.trim() || colors.length === 0}
                  className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                >
                  {isUpdating ? (
                    <>
                      <PaletteIcon className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Palette'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
