import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User, Mail, Calendar, Palette, Heart, Edit2, Save, X, Menu, Camera, Users, UserPlus } from 'lucide-react'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { usePaletteStore } from '@/store/paletteStore'
import { apiClient } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, hasHydrated } = useAuthStore()
  const { palettes, getFavorites } = usePaletteStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarKey, setAvatarKey] = useState(Date.now()) // Key to force avatar refresh
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  // Wait for hydration before checking auth and redirecting
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/signin?redirect=/profile')
    }
  }, [hasHydrated, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await apiClient.updateProfile({
        name: editForm.name,
        email: editForm.email
      })
      
      updateUser(updatedUser)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const data = await apiClient.uploadAvatar(file)
      
      updateUser({
        avatarUrl: data.avatarUrl
      })
      
      // Force avatar image refresh with new key
      setAvatarKey(Date.now())

      toast.success('Avatar updated successfully!')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toast.error('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const favoriteCount = getFavorites().length
  const totalPalettes = palettes.length

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
    )
  }

  if (!isAuthenticated) {
    return null
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
        {/* Top Navigation - Responsive */}
        <header className="sticky top-0 z-30 glass-dark border-b border-white/20 shadow-glass px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
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
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">Profile</h1>
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 hidden sm:block">Manage your account settings</p>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content - Responsive */}
        <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
          {/* Mobile: Stats first, then profile (reversed order) */}
          <div className="flex flex-col-reverse lg:flex-row lg:gap-6 gap-4">
            {/* Profile Information Card */}
            <div className="flex-1 lg:flex-[2]">
              <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-sm rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Update your personal information
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
                  {/* Profile Avatar - Responsive */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200 relative">
                        {user?.avatarUrl ? (
                          <>
                            <Image 
                              key={avatarKey}
                              src={user.avatarUrl.startsWith('http') 
                                ? user.avatarUrl 
                                : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatarUrl}?t=${avatarKey}`} 
                              alt="Profile" 
                              width={80}
                              height={80}
                              className="w-full h-full object-cover absolute inset-0 z-10"
                            />
                            <div className="absolute inset-0 bg-purple-100 z-0"></div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                            <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                        )}
                      </div>
                      {/* Camera Icon for Upload */}
                      <label 
                        htmlFor="avatar-upload"
                        className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full p-1.5 cursor-pointer hover:opacity-90 transition-opacity shadow-lg z-20"
                      >
                        <Camera className="h-3 w-3" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploadingAvatar}
                        />
                      </label>
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-30">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-neutral-900">
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Profile Form - Responsive */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs sm:text-sm font-medium text-neutral-700">
                        Full Name
                      </label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="h-10 sm:h-11 rounded-xl border-neutral-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-neutral-50/80 rounded-xl">
                          <User className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-900 truncate">{user?.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs sm:text-sm font-medium text-neutral-700">
                        Email Address
                      </label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Enter your email"
                          className="h-10 sm:h-11 rounded-xl border-neutral-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-neutral-50/80 rounded-xl">
                          <Mail className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-900 truncate">{user?.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-neutral-700">
                        Member Since
                      </label>
                      <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-neutral-50/80 rounded-xl">
                        <Calendar className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-900">
                          {new Date().toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions - Responsive */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-neutral-100">
                      <Button
                        onClick={handleSaveProfile}
                        className="btn-gradient-teal text-white rounded-xl shadow-lg shadow-teal-500/20 order-1 sm:order-none"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="rounded-xl border-neutral-200 hover:bg-neutral-50 order-2 sm:order-none"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics & Quick Actions - Responsive */}
            <div className="lg:flex-1 space-y-4">
              {/* Statistics Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-sm rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Statistics</CardTitle>
                  <CardDescription className="text-xs">Your Colorra activity</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {/* Mobile: 2x2 Grid, Desktop: Stack */}
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-purple-50/80 rounded-xl">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                          <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs sm:text-sm font-medium text-neutral-900">Palettes</p>
                          <p className="text-xs text-neutral-500">Created</p>
                        </div>
                        <p className="sm:hidden text-xs font-medium text-neutral-700">Palettes</p>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold text-purple-600">{totalPalettes}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-pink-50/80 rounded-xl">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-pink-100 rounded-lg">
                          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-600" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs sm:text-sm font-medium text-neutral-900">Favorites</p>
                          <p className="text-xs text-neutral-500">Loved</p>
                        </div>
                        <p className="sm:hidden text-xs font-medium text-neutral-700">Favorites</p>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold text-pink-600">{favoriteCount}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50/80 rounded-xl">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs sm:text-sm font-medium text-neutral-900">Followers</p>
                          <p className="text-xs text-neutral-500">Following you</p>
                        </div>
                        <p className="sm:hidden text-xs font-medium text-neutral-700">Followers</p>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold text-blue-600">{user?._count?.followers || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-teal-50/80 rounded-xl">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg">
                          <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs sm:text-sm font-medium text-neutral-900">Following</p>
                          <p className="text-xs text-neutral-500">You follow</p>
                        </div>
                        <p className="sm:hidden text-xs font-medium text-neutral-700">Following</p>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold text-teal-600">{user?._count?.following || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 shadow-sm rounded-xl sm:rounded-2xl">
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-neutral-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-smooth h-10"
                    onClick={() => router.push('/dashboard')}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    View All Palettes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-neutral-200 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 transition-smooth h-10"
                    onClick={() => router.push('/favorites')}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    View Favorites
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
