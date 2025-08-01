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
  Home
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  favoriteCount: number
}

export default function Sidebar({ isOpen, onClose, favoriteCount }: SidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

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
      href: '/dashboard?filter=favorites',
      icon: Heart,
      current: router.query.filter === 'favorites',
      badge: favoriteCount
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
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
            </Link>
          </div>

          {/* User Info */}
          <div className="mt-6 px-4">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-sm font-medium text-neutral-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-neutral-600">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-sm transition-colors',
                    item.current
                      ? 'bg-primary-50 text-primary-700 border border-[#14b8a6]'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      item.current ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-3 inline-block py-0.5 px-2 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 px-2 pb-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
            </Link>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4">
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-sm font-medium text-neutral-900">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-neutral-600">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    item.current
                      ? 'bg-primary-50 text-primary-700 border border-[#14b8a6]'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      item.current ? 'text-primary-500' : 'text-neutral-400 group-hover:text-neutral-500'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-3 inline-block py-0.5 px-2 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-2 pb-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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
