import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Palette } from '@/store/paletteStore';
import PaletteCard from '@/components/palette/PaletteCard';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users } from 'lucide-react';

export const SharedPalettesList: React.FC = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedPalettes = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getSharedPalettes();
        setPalettes(data.map((item: { palette: Palette & { bookmarks?: { userId: string }[] }; userId: string }) => ({
          ...item.palette,
          isFavorite: item.palette.bookmarks?.some((b) => b.userId === item.userId) || false,
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

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {palettes.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2 border-neutral-200 bg-white/50 backdrop-blur-sm rounded-2xl col-span-full">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-neutral-700 text-xl">
              No palettes shared with you yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-500 mb-6">
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