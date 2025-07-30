import React, { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Spinner } from './ui/spinner'
import { toast } from './ui/toast'

export const SharedPalettesList: React.FC = () => {
  const [palettes, setPalettes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shared-palettes')
      .then(res => res.json())
      .then(data => {
        setPalettes(data.data?.palettes || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load shared palettes')
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {palettes.length === 0 ? (
        <div>No palettes shared with you yet.</div>
      ) : (
        palettes.map((p: any) => (
          <Card key={p.id}>
            <div className="font-bold">{p.palette.name}</div>
            <div className="text-xs text-gray-500">Shared by: {p.sharedBy.name} ({p.sharedBy.email})</div>
            <div className="mt-2">Colors: {JSON.parse(p.palette.colors).join(', ')}</div>
            {p.message && <div className="mt-2 italic">Message: {p.message}</div>}
          </Card>
        ))
      )}
    </div>
  )
}
