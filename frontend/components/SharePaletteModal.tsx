import React, { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { toast } from './ui/toast'

interface SharePaletteModalProps {
  paletteId: string
  paletteName: string
}

export const SharePaletteModal: React.FC<SharePaletteModalProps> = ({ paletteId, paletteName }) => {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paletteId, userEmail: email, message })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Palette shared!')
        setOpen(false)
      } else {
        toast.error(data.message || 'Failed to share palette')
      }
    } catch (err) {
      toast.error('Error sharing palette')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Share Palette</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Share "{paletteName}"</DialogTitle>
        <DialogDescription>Send this palette to another user by email.</DialogDescription>
        <Input
          type="email"
          placeholder="Recipient's email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Textarea
          placeholder="Optional message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={500}
        />
        <Button onClick={handleShare} disabled={loading || !email}>Share</Button>
      </DialogContent>
    </Dialog>
  )
}
