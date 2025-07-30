import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, Mail, MessageSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { validateEmail } from '@/lib/validations'

// Import dialog and textarea components directly
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Inline Dialog components
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Inline Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

interface SharePaletteModalProps {
  paletteId: string
  paletteName: string
  colors: string[]
  trigger?: React.ReactNode
}

export default function SharePaletteModal({ 
  paletteId, 
  paletteName, 
  colors, 
  trigger 
}: SharePaletteModalProps) {
  const [open, setOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    const emailError = validateEmail(userEmail)
    if (emailError) {
      toast.error(emailError)
      return
    }

    setIsSharing(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/sharing/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paletteId,
          userEmail,
          message: message.trim() || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Palette "${paletteName}" shared successfully!`)
        setOpen(false)
        setUserEmail('')
        setMessage('')
      } else {
        toast.error(data.message || 'Failed to share palette')
      }
    } catch (error) {
      console.error('Share palette error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Palette</span>
          </DialogTitle>
          <DialogDescription>
            Share "{paletteName}" with another user
          </DialogDescription>
        </DialogHeader>

        {/* Palette Preview */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-sm text-gray-900">{paletteName}</h4>
            </div>
            <div className="flex space-x-1">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleShare} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userEmail" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>Recipient Email</span>
            </label>
            <Input
              id="userEmail"
              type="email"
              placeholder="Enter user's email address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              disabled={isSharing}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>Message (optional)</span>
            </label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              disabled={isSharing}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {message.length}/500 characters
            </p>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSharing}
              className="flex items-center space-x-1"
            >
              <Share2 className="h-4 w-4" />
              <span>{isSharing ? 'Sharing...' : 'Share Palette'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
