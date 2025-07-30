import React, { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { toast } from './ui/toast'

export const CollectionsList: React.FC = () => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setCollections(data.data?.collections || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load collections')
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.length === 0 ? (
        <div>No collections yet.</div>
      ) : (
        collections.map((c: any) => (
          <Card key={c.id}>
            <div className="font-bold">{c.name}</div>
            <div className="text-xs text-gray-500">{c.description}</div>
            <div className="mt-2">Palettes: {c.palettes.length}</div>
            <Button variant="outline" size="sm" className="mt-2">View</Button>
          </Card>
        ))
      )}
    </div>
  )
}
