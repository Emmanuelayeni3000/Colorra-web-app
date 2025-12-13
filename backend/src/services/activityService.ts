import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const createActivity = async (
  type: string,
  userId: string,
  relatedIds?: { paletteId?: string; commentId?: string; targetUserId?: string }
) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        type,
        userId,
        paletteId: relatedIds?.paletteId,
        commentId: relatedIds?.commentId,
        targetUserId: relatedIds?.targetUserId,
      },
    });
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    // Depending on criticality, you might want to throw or just log
    throw createError('Failed to create activity', 500);
  }
};

export const getGlobalFeed = async (limit: number = 20, offset: number = 0) => {
  const activities = await prisma.activity.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      palette: {
        select: {
          id: true,
          name: true,
          colors: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
      targetUser: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Parse colors for palettes
  const parsedActivities = activities.map(activity => {
    if (activity.palette && typeof activity.palette.colors === 'string') {
      return {
        ...activity,
        palette: {
          ...activity.palette,
          colors: JSON.parse(activity.palette.colors),
        },
      };
    }
    return activity;
  });

  return parsedActivities;
};

export const getPersonalizedFeed = async (userId: string, limit: number = 20, offset: number = 0) => {
  // Get users that the current user is following
  const followingUsers = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = followingUsers.map(f => f.followingId);

  const activities = await prisma.activity.findMany({
    where: {
      OR: [
        { userId: { in: followingIds } }, // Activities by users they follow
        { targetUserId: userId }, // Activities where the current user is the target (e.g., being followed)
        { userId: userId }, // Activities by the current user themselves
      ],
    },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      palette: {
        select: {
          id: true,
          name: true,
          colors: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
      targetUser: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Parse colors for palettes
  const parsedActivities = activities.map(activity => {
    if (activity.palette && typeof activity.palette.colors === 'string') {
      return {
        ...activity,
        palette: {
          ...activity.palette,
          colors: JSON.parse(activity.palette.colors),
        },
      };
    }
    return activity;
  });

  return parsedActivities;
};

export const deleteActivity = async (activityId: string, userId: string) => {
  // Find the activity first
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    throw createError('Activity not found', 404);
  }

  // Only allow the user who created the activity to delete it
  if (activity.userId !== userId) {
    throw createError('Unauthorized to delete this activity', 403);
  }

  // Delete the activity
  await prisma.activity.delete({
    where: { id: activityId },
  });

  return { message: 'Activity deleted successfully' };
};