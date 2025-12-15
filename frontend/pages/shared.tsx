import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Sidebar from '@/components/layout/Sidebar';
import { usePaletteStore } from '@/store/paletteStore';
import { SharedPalettesList } from '@/components/SharedPalettesList';
import { Button } from '@/components/ui/button';
import { Menu, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import SEO, { pageSEO } from '@/components/SEO';

const SharedPalettesPage: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getFavorites } = usePaletteStore();
  const favoriteCount = getFavorites().length;

  // Wait for hydration before checking auth
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/signin?redirect=/shared');
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
        {/* Top Navigation - Glassmorphism */}
        <header className="sticky top-0 z-30 glass-dark border-b border-white/20 shadow-glass px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-purple-50 rounded-xl transition-smooth"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                    Shared With Me
                  </h1>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-sm sm:text-base text-neutral-500">
                  Palettes shared with you by other users
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          <SharedPalettesList />
        </main>
      </div>
    </div>
  );
};

export default SharedPalettesPage;
