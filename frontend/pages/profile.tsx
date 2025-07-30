import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { User, Mail, Calendar, Palette, Heart, Edit2, Save, X, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePaletteStore } from '@/store/paletteStore'
import Sidebar from '@/components/layout/Sidebar'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const { palettes, getFavorites } = usePaletteStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
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
      // TODO: API call to update user profile
      updateUser({
        name: editForm.name,
        email: editForm.email
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    })
    setIsEditing(false)
  }

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
                    <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-primary-600" />
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
                    className="w-full justify-start hover:bg-[#14b8a6] hover:text-white"
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
