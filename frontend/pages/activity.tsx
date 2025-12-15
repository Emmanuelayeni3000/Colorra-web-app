import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Activity as ActivityIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePaletteStore } from '@/store/paletteStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/layout/Sidebar';
import ActivityFeed from '@/components/ActivityFeed';
import SEO, { pageSEO } from '@/components/SEO';

export default function ActivityPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { getFavorites } = usePaletteStore();
  const [feedType, setFeedType] = useState<'global' | 'personalized'>('global');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const favoriteCount = getFavorites().length;

  // Wait for hydration before checking auth and redirecting
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/signin?redirect=/activity');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show loading while waiting for hydration
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-purple-50/30 to-teal-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-purple-500"></div>
          </div>
          <p className="text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-purple-50/30 to-teal-50/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        favoriteCount={favoriteCount}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation - Mobile Responsive */}
        <header className="sticky top-0 z-30 glass-dark border-b border-white/20 shadow-glass px-3 py-3 sm:px-6 sm:py-4">
          {/* Mobile Layout: Stacked */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Header Title Row */}
            <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-purple-50 rounded-xl transition-smooth h-9 w-9"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                      Activity
                    </h1>
                    <ActivityIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 hidden sm:block">
                    See what&apos;s happening across Colorra
                  </p>
                </div>
              </div>
              
              {/* Mobile-only feed toggle - shows on top right on mobile */}
              <div className="sm:hidden">
                <Select onValueChange={(value: 'global' | 'personalized') => setFeedType(value)} value={feedType}>
                  <SelectTrigger className="w-[120px] h-9 bg-white/80 border-neutral-200/80 rounded-xl shadow-sm text-sm">
                    <SelectValue placeholder="Feed" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="global" className="rounded-lg text-sm">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-3.5 w-3.5 text-purple-500" />
                        <span>Global</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="personalized" className="rounded-lg text-sm">
                      <div className="flex items-center space-x-2">
                        <ActivityIcon className="h-3.5 w-3.5 text-teal-500" />
                        <span>My Feed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop Feed Type Selector */}
            <div className="hidden sm:flex items-center">
              <Select onValueChange={(value: 'global' | 'personalized') => setFeedType(value)} value={feedType}>
                <SelectTrigger className="w-[160px] bg-white/80 border-neutral-200/80 rounded-xl shadow-sm">
                  <SelectValue placeholder="Select Feed Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="global" className="rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-purple-500" />
                      <span>Global Feed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personalized" className="rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ActivityIcon className="h-4 w-4 text-teal-500" />
                      <span>My Feed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
          <ActivityFeed feedType={feedType} />
        </main>
      </div>
    </div>
  );
}