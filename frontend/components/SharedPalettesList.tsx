import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Palette } from '@/store/paletteStore';
import PaletteCard from '@/components/palette/PaletteCard';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const SharedPalettesList: React.FC = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedPalettes = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getSharedPalettes();
        setPalettes(data.map((item: any) => ({
          ...item.palette,
          isFavorite: item.palette.bookmarks?.some((b: any) => b.userId === item.userId) || false,
        })));
      } catch (err) {
        console.error('Error fetching shared palettes:', err);
        toast.error('Failed to load shared palettes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPalettes();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {palettes.length === 0 ? (
        <Card className="text-center py-12 col-span-full">
          <CardHeader>
            <CardTitle className="text-neutral-600">
              No palettes shared with you yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-500 mb-4">
              When another user shares a palette with you, it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        palettes.map((palette) => (
          <PaletteCard key={palette.id} palette={palette} isReadOnly={true} />
        ))
      )}
    </div>
  );
};