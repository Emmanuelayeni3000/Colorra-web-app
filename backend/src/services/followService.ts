import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const followUser = async (followerId: string, followingId: string) => {
  // Check if users exist
  const follower = await prisma.user.findUnique({ where: { id: followerId } });
  const following = await prisma.user.findUnique({ where: { id: followingId } });

  if (!follower || !following) {
    throw createError('User not found', 404);
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    throw createError('Already following this user', 400);
  }

  const follow = await prisma.follow.create({
    data: {
      followerId,
      followingId,
    },
  });
  return follow;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!follow) {
    throw createError('Not following this user', 400);
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
};

export const getFollowers = async (userId: string) => {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
  return followers.map(f => f.follower);
};

export const getFollowing = async (userId: string) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
  return following.map(f => f.following);
};