import React, { useState } from 'react';
import { NextPage } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import { usePaletteStore } from '@/store/paletteStore';
import { SharedPalettesList } from '@/components/SharedPalettesList';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const SharedPalettesPage: NextPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getFavorites } = usePaletteStore();
  const favoriteCount = getFavorites().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/3 to-[#14b8a6]/3">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                  Shared With Me
                </h1>
                <p className="text-sm sm:text-base text-neutral-600">
                  Palettes shared with you by other users
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 sm:p-8">
          <SharedPalettesList />
        </main>
      </div>
    </div>
  );
};

export default SharedPalettesPage;
