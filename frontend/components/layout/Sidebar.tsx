import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import {
  Palette,
  Heart,
  User,
  LogOut,
  X,
  Home,
  Users,
  Star,
  Bell
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  favoriteCount: number
}

export default function Sidebar({ isOpen, onClose, favoriteCount }: SidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return ''
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const baseUrl = apiUrl.replace('/api', '')
    return `${baseUrl}${user.avatarUrl}?t=${Date.now()}`
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: router.pathname === '/dashboard'
    },
    {
      name: 'All Palettes',
      href: '/dashboard',
      icon: Palette,
      current: router.pathname === '/dashboard' && !router.query.filter
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Heart,
      current: router.pathname === '/favorites',
      badge: favoriteCount
    },
    {
      name: 'Saved Palettes',
      href: '/saved',
      icon: Star,
      current: router.pathname === '/saved'
    },
    {
      name: 'Shared Palettes',
      href: '/shared',
      icon: Users,
      current: router.pathname === '/shared'
    },
    {
      name: 'Activity',
      href: '/activity',
      icon: Bell,
      current: router.pathname === '/activity'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: router.pathname === '/profile'
    }
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow glass-sidebar border-r border-white/20 shadow-glass pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-2">
            <Link href="/" className="flex items-center space-x-2 transition-smooth hover:opacity-80">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={100} height={80} />
            </Link>
          </div>

          {/* User Info Card */}
          <div className="mx-4 mt-4">
            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl p-4 border border-purple-100/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-purple-200 ring-offset-2">
                  <AvatarImage src={getAvatarUrl()} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white font-semibold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-smooth',
                    item.current
                      ? 'nav-active text-purple-700'
                      : 'text-neutral-600 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-teal-50/50 hover:text-neutral-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-smooth',
                      item.current 
                        ? 'text-purple-600' 
                        : 'text-neutral-400 group-hover:text-purple-500'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-3 inline-flex items-center justify-center py-0.5 px-2.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 px-3 pb-4">
            <div className="border-t border-neutral-200/50 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 glass-sidebar border-r border-white/20 shadow-elevated transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200/50">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={100} height={80} />
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-smooth"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* User Info Card */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl p-4 border border-purple-100/50 shadow-sm">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-purple-200 ring-offset-2">
                  <AvatarImage src={getAvatarUrl()} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white font-semibold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-smooth',
                    item.current
                      ? 'nav-active text-purple-700'
                      : 'text-neutral-600 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-teal-50/50 hover:text-neutral-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-smooth',
                      item.current 
                        ? 'text-purple-600' 
                        : 'text-neutral-400 group-hover:text-purple-500'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-3 inline-flex items-center justify-center py-0.5 px-2.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-3 pb-4 border-t border-neutral-200/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}