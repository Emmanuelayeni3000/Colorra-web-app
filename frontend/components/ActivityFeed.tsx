import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Palette, MessageSquare, UserPlus, Bookmark } from 'lucide-react';
import { getContrastingTextColor } from '@/lib/utils';

interface Activity {
  id: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  palette?: {
    id: string;
    name: string;
    colors: string[];
  };
  comment?: {
    id: string;
    content: string;
  };
  targetUser?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface ActivityFeedProps {
  feedType: 'global' | 'personalized';
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ feedType }) => {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedActivities: Activity[];
      if (feedType === 'global') {
        fetchedActivities = await apiClient.getGlobalActivityFeed();
      } else {
        if (!isAuthenticated) {
          setError('Please sign in to view your personalized feed.');
          return;
        }
        fetchedActivities = await apiClient.getPersonalizedActivityFeed();
      }
      setActivities(fetchedActivities);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError('Failed to load activity feed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [feedType, isAuthenticated]);

  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`;
  };

  const renderActivityContent = (activity: Activity) => {
    const userLink = (
      <Link href={`/users/${activity.user.id}`} className="font-semibold text-purple-600 hover:underline">
        {activity.user.name || 'Anonymous'}
      </Link>
    );

    switch (activity.type) {
      case 'PALETTE_CREATED':
        return (
          <>
            {userLink} created a new palette{' '}
            {activity.palette && (
              <Link href={`/palettes/${activity.palette.id}`} className="font-semibold text-teal-600 hover:underline">
                "{activity.palette.name}"
              </Link>
            )}
            .
          </>
        );
      case 'PALETTE_BOOKMARKED':
        return (
          <>
            {userLink} bookmarked palette{' '}
            {activity.palette && (
              <Link href={`/palettes/${activity.palette.id}`} className="font-semibold text-teal-600 hover:underline">
                "{activity.palette.name}"
              </Link>
            )}
            .
          </>
        );
      case 'COMMENT_ADDED':
        return (
          <>
            {userLink} commented on palette{' '}
            {activity.palette && (
              <Link href={`/palettes/${activity.palette.id}`} className="font-semibold text-teal-600 hover:underline">
                "{activity.palette.name}"
              </Link>
            )}
            : "{activity.comment?.content}".
          </>
        );
      case 'USER_FOLLOWED':
        return (
          <>
            {userLink} started following{' '}
            {activity.targetUser && (
              <Link href={`/users/${activity.targetUser.id}`} className="font-semibold text-purple-600 hover:underline">
                {activity.targetUser.name || 'Anonymous'}
              </Link>
            )}
            .
          </>
        );
      default:
        return `${userLink} performed an unknown action.`;
    }
  };

  const renderActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'PALETTE_CREATED':
        return <Palette className="h-5 w-5 text-purple-500" />;
      case 'PALETTE_BOOKMARKED':
        return <Bookmark className="h-5 w-5 text-blue-500" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'USER_FOLLOWED':
        return <UserPlus className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8 bg-white/50">
        <CardHeader>
          <CardTitle className="text-red-500">{error}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="text-center py-8 bg-white/50">
        <CardHeader>
          <CardTitle className="text-neutral-600">No activities to display yet.</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-start space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={getFullAvatarUrl(activity.user.avatarUrl)} alt={activity.user.name || 'User'} />
              <AvatarFallback>{activity.user.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {renderActivityIcon(activity)}
                <p className="text-sm text-neutral-700">
                  {renderActivityContent(activity)}
                </p>
              </div>
              {activity.palette && activity.palette.colors && (
                <div className="flex h-12 w-full rounded-md overflow-hidden border border-gray-200 mt-2">
                  {activity.palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              )}
              <span className="text-xs text-neutral-500 mt-1 block">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityFeed;