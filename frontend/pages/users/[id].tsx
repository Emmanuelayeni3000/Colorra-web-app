import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, UserMinus, Settings, Share, Grid3X3, Bookmark } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Palette } from '@/store/paletteStore';
import PublicPaletteCard from '@/components/palette/PublicPaletteCard';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  _count: {
    followers: number;
    following: number;
    palettes: number;
  };
}

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('palettes');

  const fetchUserProfile = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [userProfile, userPalettes] = await Promise.all([
        apiClient.getProfileById(id as string),
        apiClient.getPublicPalettesByUserId(id as string),
      ]);
      setProfile(userProfile);
      setPalettes(userPalettes);

      if (isAuthenticated && currentUser?.id !== id) {
        const following = await apiClient.getFollowing(currentUser!.id);
        setIsFollowing(following.some((f: { id: string }) => f.id === id));
      } else {
        setIsFollowing(false);
      }

    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile.');
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, currentUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to follow users.');
      router.push('/signin');
      return;
    }
    if (!profile) return;

    try {
      if (isFollowing) {
        await apiClient.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, _count: { ...prev._count, followers: prev._count.followers - 1 } } : null);
        toast.success(`You unfollowed ${profile.name}.`);
      } else {
        await apiClient.followUser(profile.id);
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, _count: { ...prev._count, followers: prev._count.followers + 1 } } : null);
        toast.success(`You are now following ${profile.name}.`);
      }
    } catch (err: unknown) {
      console.error('Failed to toggle follow:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update follow status.';
      toast.error(errorMessage);
    }
  };

  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500">
        <p>{error || 'User not found.'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header - Instagram Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Profile Picture */}
            <div className="flex justify-center md:justify-start">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-gradient-to-r from-purple-400 to-teal-400 ring-offset-4">
                <AvatarImage src={getFullAvatarUrl(profile.avatarUrl)} alt={profile.name} />
                <AvatarFallback className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 text-white">
                  {profile.name?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-0">
                  {profile.name}
                </h1>
                {!isOwnProfile && isAuthenticated && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleFollowToggle} 
                      className={`px-6 ${isFollowing 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" /> Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="px-4">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="px-6"
                    onClick={() => router.push('/profile')}
                  >
                    <Settings className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{palettes.length}</div>
                  <div className="text-sm text-gray-600">palettes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile._count.followers}</div>
                  <div className="text-sm text-gray-600">followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile._count.following}</div>
                  <div className="text-sm text-gray-600">following</div>
                </div>
              </div>

              {/* Bio */}
              <div className="text-gray-700 max-w-lg">
                <p className="font-semibold">{profile.name}</p>
                <p>{profile.bio || 'Color palette enthusiast 🎨 Creating beautiful combinations for the world to see.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 border-b-0">
          <div className="flex justify-center border-b border-gray-200">
            <button
              onClick={() => setActiveTab('palettes')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'palettes'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              PALETTES
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                SAVED
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0 p-8">
          {activeTab === 'palettes' && (
            <>
              {palettes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <Grid3X3 className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No palettes yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? 'When you create your first palette, it will appear here.' 
                      : `${profile.name} hasn't shared any palettes yet.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {palettes.map((palette) => (
                    <PublicPaletteCard key={palette.id} palette={palette} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && isOwnProfile && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Bookmark className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Saved palettes</h3>
              <p className="text-gray-600">
                Palettes you bookmark will appear here. Go to{' '}
                <Link href="/saved" className="text-blue-500 hover:underline">
                  saved palettes
                </Link>{' '}
                to see all your bookmarked palettes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}