import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, LogOut, User, LayoutDashboard, ChevronDown, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ActivityFeed from '@/components/ActivityFeed'; // Import the new component

export default function ActivityPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [feedType, setFeedType] = useState<'global' | 'personalized'>('global');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/activity');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/10 to-[#14b8a6]/10">
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[200%] bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-transparent -z-10 opacity-50 blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={100} height={80} />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatarUrl ? (
                      user.avatarUrl.startsWith('http') 
                        ? user.avatarUrl 
                        : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatarUrl}?t=${Date.now()}`
                    ) : ''}
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback>{user?.name?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}> 
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}> 
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-neutral-900">Activity Feed</h1>
          <p className="text-xl text-neutral-600 mt-2">See what's happening across Colorra.</p>
        </div>

        <div className="flex justify-center mb-8">
          <Select onValueChange={(value: 'global' | 'personalized') => setFeedType(value)} value={feedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Feed Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global Feed</SelectItem>
              <SelectItem value="personalized">My Personalized Feed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ActivityFeed feedType={feedType} />
      </main>
    </div>
  );
}