import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Palette, MessageSquare, UserPlus, Bookmark, Trash2, Activity } from 'lucide-react';
import { toast } from 'sonner';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
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
  }, [feedType, isAuthenticated]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getFullAvatarUrl = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}?t=${Date.now()}`;
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to remove this activity?')) {
      return;
    }
    
    setDeletingId(activityId);
    try {
      await apiClient.deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
      toast.success('Activity removed successfully');
    } catch (err: unknown) {
      console.error('Failed to delete activity:', err);
      const error = err as { response?: { data?: { message?: string } } };
      const message = error?.response?.data?.message || 'Failed to remove activity';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const renderActivityContent = (activity: Activity) => {
    const userLink = (
      <Link href={`/users/${activity.user.id}`} className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-smooth">
        {activity.user.name || 'Anonymous'}
      </Link>
    );

    switch (activity.type) {
      case 'PALETTE_CREATED':
        return (
          <>
            {userLink} created a new palette{' '}
            {activity.palette && (
              <Link href={`/palettes/${activity.palette.id}`} className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-smooth">
                &quot;{activity.palette.name}&quot;
              </Link>
            )}
          </>
        );
      case 'PALETTE_BOOKMARKED':
        return (
          <>
            {userLink} bookmarked palette{' '}
            {activity.palette && (
              <Link href={`/palettes/${activity.palette.id}`} className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-smooth">
                &quot;{activity.palette.name}&quot;
              </Link>
            )}
          </>
        );
      case 'COMMENT_ADDED':
        return (
          <>
            {userLink} commented on palette{' '}
            {activity.palette && (
              <Link href={`/palettes/${activity.palette.id}`} className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-smooth">
                &quot;{activity.palette.name}&quot;
              </Link>
            )}
            {activity.comment && (
              <span className="text-neutral-500">: &quot;{activity.comment.content}&quot;</span>
            )}
          </>
        );
      case 'USER_FOLLOWED':
        return (
          <>
            {userLink} started following{' '}
            {activity.targetUser && (
              <Link href={`/users/${activity.targetUser.id}`} className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-smooth">
                {activity.targetUser.name || 'Anonymous'}
              </Link>
            )}
          </>
        );
      default:
        return (
          <>
            {userLink} performed an action.
          </>
        );
    }
  };

  const renderActivityIcon = (activity: Activity) => {
    const iconClasses = "h-4 w-4";
    switch (activity.type) {
      case 'PALETTE_CREATED':
        return (
          <div className="p-1.5 rounded-lg bg-purple-100">
            <Palette className={`${iconClasses} text-purple-600`} />
          </div>
        );
      case 'PALETTE_BOOKMARKED':
        return (
          <div className="p-1.5 rounded-lg bg-amber-100">
            <Bookmark className={`${iconClasses} text-amber-600`} />
          </div>
        );
      case 'COMMENT_ADDED':
        return (
          <div className="p-1.5 rounded-lg bg-green-100">
            <MessageSquare className={`${iconClasses} text-green-600`} />
          </div>
        );
      case 'USER_FOLLOWED':
        return (
          <div className="p-1.5 rounded-lg bg-blue-100">
            <UserPlus className={`${iconClasses} text-blue-600`} />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">{error}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="text-center py-16 border-dashed border-2 border-neutral-200 bg-white/50 backdrop-blur-sm rounded-2xl">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-neutral-700 text-xl">No activities to display yet</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md rounded-xl sm:rounded-2xl border-neutral-200/50 transition-smooth overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white shadow-sm flex-shrink-0">
                <AvatarImage src={getFullAvatarUrl(activity.user.avatarUrl)} alt={activity.user.name || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-teal-500 text-white font-semibold text-xs sm:text-sm">
                  {activity.user.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderActivityIcon(activity)}
                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                      {renderActivityContent(activity)}
                    </p>
                  </div>
                  {/* Delete button - only show for own activities */}
                  {currentUser && activity.user.id === currentUser.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-smooth"
                      onClick={() => handleDeleteActivity(activity.id)}
                      disabled={deletingId === activity.id}
                      title="Remove this activity"
                    >
                      {deletingId === activity.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {activity.palette && activity.palette.colors && (
                  <div className="flex h-8 sm:h-10 w-full rounded-lg sm:rounded-xl overflow-hidden border border-neutral-200/50 mt-2 sm:mt-3 shadow-sm">
                    {activity.palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 transition-smooth hover:flex-[1.5]"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                )}
                <span className="text-xs text-neutral-400 mt-2 block">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityFeed;