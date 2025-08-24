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
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const { palettes, getFavorites } = usePaletteStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthenticated, router])

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
      // Call API to update user profile
      const updatedUser = await apiClient.updateProfile({
        name: editForm.name,
        email: editForm.email
      })
      
      // Update local store with response from server
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

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      // Use the apiClient to upload avatar
      const data = await apiClient.uploadAvatar(file)
      
      // Update user in store with new avatar URL
      updateUser({
        avatarUrl: data.avatarUrl
      })

      toast.success('Avatar updated successfully!')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      toast.error('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Debug user state
  useEffect(() => {
    console.log('Current user state:', user)
    console.log('User avatar URL:', user?.avatarUrl)
    if (user?.avatarUrl) {
      const constructedUrl = user.avatarUrl.startsWith('http') 
        ? user.avatarUrl 
        : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatarUrl}?t=${Date.now()}`
      console.log('Constructed avatar URL:', constructedUrl)
    }
  }, [user])

  const favoriteCount = getFavorites().length
  const totalPalettes = palettes.length

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-neutral-50">
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
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
                <p className="text-neutral-600">Manage your account settings</p>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <div className="px-4 py-6 sm:px-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and account details
                      </CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className='hover:bg-[#14b8a6] hover:text-white'
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 relative" style={{minWidth: '80px', minHeight: '80px'}}>
                        {user?.avatarUrl ? (
                          <>
                            <Image 
                              src={user.avatarUrl.startsWith('http') 
                                ? user.avatarUrl 
                                : `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatarUrl}?t=${Date.now()}`} 
                              alt="Profile" 
                              width={80}
                              height={80}
                              className="w-full h-full object-cover absolute inset-0 z-10"
                              style={{
                                display: 'block',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                console.error('Avatar image failed to load:', e.currentTarget.src)
                              }}
                              onLoad={(e) => {
                                console.log('Avatar image loaded successfully:', user.avatarUrl)
                                console.log('Actual image URL:', e.currentTarget.src)
                                console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight)
                                console.log('Image computed styles:', window.getComputedStyle(e.currentTarget))
                              }}
                            />
                            {/* Fallback background only shows if image fails */}
                            <div className="absolute inset-0 bg-primary-100 z-0"></div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                            <User className="h-10 w-10 text-primary-600" />
                          </div>
                        )}
                      </div>
                      {/* Camera Icon for Upload */}
                      <label 
                        htmlFor="avatar-upload"
                        className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1.5 cursor-pointer hover:bg-primary-600 transition-colors shadow-lg z-20"
                        style={{ zIndex: 20 }}
                        onClick={() => {
                          console.log('Camera icon clicked!')
                          // Don't prevent default - let the label work
                        }}
                      >
                        <Camera className="h-3 w-3" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploadingAvatar}
                          onClick={() => {
                            console.log('File input clicked!')
                          }}
                        />
                      </label>
                      {/* Loading indicator */}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-30">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900">
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-neutral-600">{user?.email}</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                        Full Name
                      </label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-md">
                          <User className="h-4 w-4 text-neutral-400" />
                          <span className="text-neutral-900">{user?.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                        Email Address
                      </label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Enter your email"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-md">
                          <Mail className="h-4 w-4 text-neutral-400" />
                          <span className="text-neutral-900">{user?.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">
                        Member Since
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-md">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <span className="text-neutral-900">
                          {new Date().toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  {isEditing && (
                    <div className="flex items-center space-x-3 pt-4 border-t">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-primary text-white hover:bg-primary-600"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className='hover:bg-[#14b8a6] hover:text-white'
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                  <CardDescription>Your Colorra activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Palette className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Total Palettes</p>
                        <p className="text-xs text-neutral-600">Created by you</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-primary-600">{totalPalettes}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Favorites</p>
                        <p className="text-xs text-neutral-600">Palettes you love</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{favoriteCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Followers</p>
                        <p className="text-xs text-neutral-600">People following you</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{user?._count?.followers || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserPlus className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Following</p>
                        <p className="text-xs text-neutral-600">People you follow</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{user?._count?.following || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-[#14b8a6] hover:text-white"
                    onClick={() => router.push('/dashboard')}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    View All Palettes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-white hover:bg-[#14b8a6] hover:text-white"
                    onClick={() => router.push('/dashboard?filter=favorites')}
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
