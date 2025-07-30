import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Upload, Wand2, Palette as PaletteIcon } from 'lucide-react'
import { ChromePicker } from 'react-color'
import { usePaletteActions } from '@/hooks/usePaletteActions'
import { extractColorsFromImage, validateImageFile, generateComplementaryColors } from '@/lib/colorExtraction'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CreatePaletteModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

export default function CreatePaletteModal({ isOpen, onClose, onCreated }: CreatePaletteModalProps) {
  const { createPalette } = usePaletteActions()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [colors, setColors] = useState<string[]>(['#7F56D9'])
  const [activeColorIndex, setActiveColorIndex] = useState(0)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleColorChange = (color: any) => {
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

  const generateRandomColors = () => {
    const baseColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
    const generatedColors = generateComplementaryColors(baseColor)
    setColors(generatedColors)
    setActiveColorIndex(0)
    toast.success('Random colors generated!')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsExtracting(true)
      validateImageFile(file)
      
      const extractedColors = await extractColorsFromImage(file, 5)
      const hexColors = extractedColors.map(color => color.hex)
      
      setColors(hexColors)
      setActiveColorIndex(0)
      toast.success(`Extracted ${hexColors.length} colors from image!`)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsExtracting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || colors.length === 0) return

    setIsLoading(true)
    try {
      await createPalette({
        name: name.trim(),
        description: description.trim() || undefined,
        colors,
      })

      // Reset form
      setName('')
      setDescription('')
      setColors(['#7F56D9'])
      setActiveColorIndex(0)
      setShowColorPicker(false)

      if (onCreated) onCreated()
      onClose()
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-2xl font-bold text-neutral-900">
              Create New Palette
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
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

              {/* Color Generation Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-700">
                  Generate Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomColors}
                    className="flex items-center hover:bg-[#14b8a6] hover:text-white"
                    disabled={isExtracting}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Random Colors
                  </Button>
                  
                  <label className="inline-flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center hover:bg-[#14b8a6] hover:text-white"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={isExtracting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isExtracting ? 'Extracting...' : 'From Image'}
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-3">
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
                    className="bg-primary text-white hover:bg-[#14b8a6] hover:text-white"
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
                          "w-full h-20 rounded-lg cursor-pointer border-4 transition-all",
                          activeColorIndex === index
                            ? "border-primary shadow-lg"
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
                            className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
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
                  <div className="flex justify-center">
                    <ChromePicker
                      color={colors[activeColorIndex]}
                      onChange={handleColorChange}
                      disableAlpha
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name.trim() || colors.length === 0 || isLoading}
                  className="bg-primary hover:bg-primary-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PaletteIcon className="h-4 w-4 mr-2" />
                      Create Palette
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
