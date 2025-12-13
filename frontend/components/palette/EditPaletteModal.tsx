import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Palette as PaletteIcon, Pencil } from 'lucide-react'
import { ChromePicker } from 'react-color'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import { usePaletteStore, Palette } from '@/store/paletteStore'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-scale-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-2xl font-bold text-neutral-900">
                  Edit Palette
                </CardTitle>
                <Pencil className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-neutral-500 mt-1">Update your color palette</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-neutral-100 rounded-xl transition-smooth"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Palette Name */}
              <div className="space-y-2">
                <Label htmlFor="editName" className="text-neutral-700">
                  Palette Name *
                </Label>
                <Input
                  id="editName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter palette name"
                  required
                  className="h-11 rounded-xl border-neutral-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-smooth"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="editDescription" className="text-neutral-700">
                  Description
                </Label>
                <Input
                  id="editDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="h-11 rounded-xl border-neutral-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-smooth"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="editCategory" className="text-neutral-700">
                  Category
                </Label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className="w-full h-11 rounded-xl border-neutral-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Make Public - Using Switch component */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-teal-50/50 rounded-xl border border-purple-100/50">
                <div className="space-y-0.5">
                  <Label htmlFor="editIsPublic" className="text-neutral-700">
                    Make Public
                  </Label>
                  <p className="text-xs text-neutral-500">Share this palette with the community</p>
                </div>
                <Switch
                  id="editIsPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-neutral-700">Colors ({colors.length}/10)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColor}
                    disabled={colors.length >= 10}
                    className="btn-gradient text-white border-0 rounded-xl shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Color
                  </Button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {colors.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className={cn(
                          "w-full h-16 rounded-xl cursor-pointer transition-all duration-200",
                          activeColorIndex === index
                            ? "ring-4 ring-purple-500/30 shadow-lg scale-105"
                            : "ring-2 ring-neutral-200 hover:ring-neutral-300 hover:shadow-md"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setActiveColorIndex(index)
                          setShowColorPicker(true)
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-500">
                          {color}
                        </span>
                        {colors.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeColor(index)}
                            className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-smooth"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {showColorPicker && (
                  <div className="space-y-3 animate-scale-in">
                    <div className="flex items-center justify-between">
                      <Label className="text-neutral-700">Color Picker</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowColorPicker(false)}
                        className="rounded-xl transition-smooth"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-center bg-neutral-50 p-4 rounded-xl border border-neutral-100">
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
              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-xl border-neutral-200 hover:bg-neutral-50 transition-smooth"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || !name.trim() || colors.length === 0}
                  className="flex-1 btn-gradient text-white rounded-xl shadow-lg shadow-purple-500/20"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <PaletteIcon className="h-4 w-4 mr-2" />
                      Update Palette
                    </>
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
